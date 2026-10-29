import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, type ScrollViewInstance } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { AppText, type TextTone } from '@/components/app-text';
import { IconButton } from '@/components/icon-button';
import { PressableScale } from '@/components/pressable-scale';
import { config, type CodeLanguage } from '@/config';

import { centredOffset } from './scroll';
import type { CodePanelSample, CodeRole } from './types';

/** Plain code uses the line's own colour (ink). */
const ROLE_TONE: Record<CodeRole, TextTone | undefined> = {
  plain: undefined,
  keyword: 'code-keyword',
  name: 'code-name',
  string: 'code-string',
  number: 'code-number',
  comment: 'code-comment',
};

export const CODE_LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  pseudocode: 'Pseudocode',
  javascript: 'JavaScript',
};

export type CodePanelProps = {
  sample: CodePanelSample;
  language: CodeLanguage;
  onLanguageChange: (language: CodeLanguage) => void;
  /** The current step's line id. Its lines are highlighted and scrolled into view. */
  lineId?: string;
  /** Size and position within the parent only. */
  className?: string;
};

/**
 * The code being run, with the current line highlighted (F-501), a language switch (F-502) and
 * copy (F-505). VISUAL-SPEC §6 "Code panel". Long lines scroll sideways instead of wrapping, so
 * every line stays one row tall and line numbers stay aligned.
 */
export function CodePanel({
  sample,
  language,
  onLanguageChange,
  lineId,
  className,
}: CodePanelProps) {
  const highlighted = new Set(lineId ? (sample.lineIds[lineId] ?? []) : []);
  const firstHighlighted = lineId ? sample.lineIds[lineId]?.[0] : undefined;

  // Keep the current line in view: rows are all one line tall, so a line's top is index × height.
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [rowHeight, setRowHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (firstHighlighted === undefined || rowHeight === 0 || viewportHeight === 0) return;
    const y = centredOffset({
      lineTop: firstHighlighted * rowHeight,
      lineHeight: rowHeight,
      viewportHeight,
      contentHeight: sample.lines.length * rowHeight,
    });
    scrollRef.current?.scrollTo({ y, animated: !reducedMotion });
  }, [firstHighlighted, rowHeight, viewportHeight, sample, reducedMotion]);

  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), config.code.copiedFeedbackMs);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = async () => {
    await Clipboard.setStringAsync(sample.source);
    setCopied(true);
  };

  return (
    <View className={`overflow-hidden rounded-lg bg-surface ${className ?? ''}`}>
      <View className="flex-row items-center justify-between pt-1 pr-1 pl-2">
        <View accessibilityRole="tablist" className="flex-row gap-1">
          {config.app.codeLanguages.map((option) => {
            const selected = option === language;
            return (
              <PressableScale
                key={option}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => onLanguageChange(option)}
                contentClassName={`h-9 justify-center rounded-full px-3 ${selected ? 'bg-primary-soft' : ''}`}
              >
                <AppText
                  variant="label"
                  weight={selected ? 'medium' : 'regular'}
                  tone={selected ? 'primary' : 'muted'}
                >
                  {CODE_LANGUAGE_LABELS[option]}
                </AppText>
              </PressableScale>
            );
          })}
        </View>
        <IconButton
          icon={copied ? 'done' : 'copy'}
          label={copied ? 'Copied' : 'Copy code'}
          active={copied}
          onPress={copy}
        />
      </View>

      <ScrollView
        ref={scrollRef}
        className="shrink"
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
      >
        <ScrollView horizontal contentContainerClassName="grow px-2 pb-2">
          <View className="grow">
            {sample.lines.map((tokens, index) => {
              const current = highlighted.has(index);
              const text = tokens.map(([part]) => part).join('');
              return (
                <View
                  key={index}
                  accessible
                  accessibilityLabel={`${current ? 'Current line, ' : ''}line ${index + 1}: ${text}`}
                  onLayout={
                    index === 0
                      ? (event) => setRowHeight(event.nativeEvent.layout.height)
                      : undefined
                  }
                  className={`flex-row gap-3 rounded-sm px-2 ${current ? 'bg-signal-soft' : ''}`}
                >
                  <AppText
                    variant="code"
                    tone={current ? 'signal-ink' : 'muted'}
                    className="w-6 text-right"
                  >
                    {index + 1}
                  </AppText>
                  <AppText variant="code">
                    {tokens.length === 0
                      ? ' '
                      : tokens.map(([part, role], i) => {
                          const tone = ROLE_TONE[role];
                          return tone ? (
                            <AppText key={i} variant="code" tone={tone}>
                              {part}
                            </AppText>
                          ) : (
                            part
                          );
                        })}
                  </AppText>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}
