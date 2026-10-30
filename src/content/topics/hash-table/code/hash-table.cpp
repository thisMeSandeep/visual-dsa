#include <list>
#include <optional>
#include <stdexcept>
#include <string>
#include <vector>

// Which bucket a key belongs in: hash it, then wrap the hash to the table's size.
std::size_t bucketOf(const std::string& key, std::size_t size) {
  std::size_t h = 0;
  for (char ch : key) h += static_cast<unsigned char>(ch); // @line hash-fn
  return h % size; // @line hash-index
}
// A better hash mixes the letters as it goes: h = h * 31 + code.

struct Entry {
  std::string key;
  int value;
};

class ChainedHashTable {
  std::vector<std::list<Entry>> buckets;
  std::size_t count = 0;
  double loadLimit;

 public:
  explicit ChainedHashTable(std::size_t size, double loadLimit = 0.75)
      : buckets(size), loadLimit(loadLimit) {}

  void put(const std::string& key, int value) {
    bool isNew = !get(key).has_value();
    if (isNew && (count + 1.0) / buckets.size() > loadLimit) { // @line c-resize-check
      resize(); // @line c-resize-done
    }
    auto& chain = buckets[bucketOf(key, buckets.size())];
    for (auto& entry : chain) {
      if (entry.key == key) { // @line c-put-compare
        entry.value = value; // @line c-put-update
        return;
      }
    }
    chain.push_back({key, value}); // @line c-put-append
    count++; // @line c-put-append
  }

  std::optional<int> get(const std::string& key) const {
    const auto& chain = buckets[bucketOf(key, buckets.size())];
    for (const auto& entry : chain) {
      if (entry.key == key) { // @line c-get-compare
        return entry.value; // @line c-get-found
      }
    }
    return std::nullopt; // @line c-get-missing
  }

  void remove(const std::string& key) {
    auto& chain = buckets[bucketOf(key, buckets.size())];
    for (auto it = chain.begin(); it != chain.end(); ++it) {
      if (it->key == key) { // @line c-remove-compare
        chain.erase(it); // @line c-remove-unlink
        count--; // @line c-remove-unlink
        return;
      }
    }
    // not in the table: nothing to remove // @line c-remove-missing
  }

 private:
  void resize() {
    auto old = std::move(buckets); // @line c-resize
    buckets = std::vector<std::list<Entry>>(old.size() * 2); // @line c-resize
    for (const auto& chain : old) {
      for (const auto& entry : chain) {
        buckets[bucketOf(entry.key, buckets.size())].push_back(entry); // @line c-rehash
      }
    }
  }
};

class ProbingHashTable {
  enum class State { Empty, Full, Tombstone };
  struct Slot {
    State state = State::Empty;
    Entry entry;
  };
  std::vector<Slot> slots;
  std::size_t count = 0;
  double loadLimit;

 public:
  explicit ProbingHashTable(std::size_t size, double loadLimit = 0.75)
      : slots(size), loadLimit(loadLimit) {}

  void put(const std::string& key, int value) {
    bool isNew = !get(key).has_value();
    if (isNew && (count + 1.0) / slots.size() > loadLimit) { // @line p-resize-check
      resize(); // @line p-resize-done
    }
    std::size_t home = bucketOf(key, slots.size());
    long reuse = -1;
    for (std::size_t k = 0; k < slots.size(); k++) {
      std::size_t i = (home + k) % slots.size();
      Slot& slot = slots[i];
      if (slot.state == State::Tombstone) {
        if (reuse < 0) reuse = static_cast<long>(i); // @line p-put-tombstone
      } else if (slot.state == State::Empty) {
        slots[reuse >= 0 ? reuse : i] = {State::Full, {key, value}}; // @line p-put-place
        count++; // @line p-put-place
        return;
      } else if (slot.entry.key == key) { // @line p-put-probe
        slot.entry.value = value; // @line p-put-update
        return;
      }
    }
    if (reuse < 0) throw std::overflow_error("The table is full"); // @line p-full
    slots[reuse] = {State::Full, {key, value}}; // @line p-put-place
    count++; // @line p-put-place
  }

  std::optional<int> get(const std::string& key) const {
    std::size_t home = bucketOf(key, slots.size());
    for (std::size_t k = 0; k < slots.size(); k++) { // @line p-get-probe
      const Slot& slot = slots[(home + k) % slots.size()];
      if (slot.state == State::Empty) return std::nullopt; // @line p-get-missing
      if (slot.state == State::Full && slot.entry.key == key) return slot.entry.value; // @line p-get-found
    }
    return std::nullopt; // @line p-get-missing
  }

  void remove(const std::string& key) {
    std::size_t home = bucketOf(key, slots.size());
    for (std::size_t k = 0; k < slots.size(); k++) { // @line p-remove-probe
      Slot& slot = slots[(home + k) % slots.size()];
      if (slot.state == State::Empty) return; // @line p-remove-missing
      if (slot.state == State::Full && slot.entry.key == key) {
        slot.state = State::Tombstone; // @line p-remove-mark
        count--; // @line p-remove-mark
        return;
      }
    }
  }

 private:
  void resize() {
    auto old = std::move(slots); // @line p-resize
    slots = std::vector<Slot>(old.size() * 2); // @line p-resize
    count = 0;
    for (const auto& slot : old) {
      if (slot.state == State::Full) put(slot.entry.key, slot.entry.value); // @line p-rehash
    }
  }
};
