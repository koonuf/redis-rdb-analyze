"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SortedList {
    constructor(maxItemCount) {
        this.maxItemCount = maxItemCount;
        this.size = 0;
    }
    addItem(data) {
        if (this.head) {
            if (this.size === this.maxItemCount) {
                this.replaceItem(data);
            }
            else {
                this.addItemInternal(data);
                this.size++;
            }
        }
        else {
            this.head = this.tail = { data };
            this.size = 1;
        }
    }
    getItems() {
        const result = new Array(this.size);
        let item = this.head, i = 0;
        while (item) {
            result[i++] = item.data;
            item = item.next;
        }
        return result;
    }
    replaceItem(data) {
        const nextLarger = this.findNextLarger(data);
        if (nextLarger === this.head) {
            return; // data smaller than current smallest
        }
        // remove head
        const secondItem = this.head.next;
        if (secondItem) {
            secondItem.prev = undefined;
        }
        const newNode = { data };
        if (nextLarger) {
            newNode.next = nextLarger;
            newNode.prev = nextLarger.prev;
            if (nextLarger.prev) {
                nextLarger.prev.next = newNode;
            }
            nextLarger.prev = newNode;
            this.head = nextLarger === secondItem ? newNode : secondItem;
        }
        else {
            if (this.tail !== this.head) {
                this.tail.next = newNode;
                newNode.prev = this.tail;
            }
            this.head = secondItem || newNode;
            this.tail = newNode;
        }
    }
    addItemInternal(data) {
        const nextLarger = this.findNextLarger(data);
        const newNode = { data };
        if (nextLarger) {
            newNode.next = nextLarger;
            newNode.prev = nextLarger.prev;
            if (newNode.prev) {
                newNode.prev.next = newNode;
            }
            nextLarger.prev = newNode;
            if (nextLarger === this.head) {
                this.head = newNode;
            }
        }
        else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }
    }
    findNextLarger(data) {
        let result = this.head;
        while (result && result.data.weight <= data.weight) {
            result = result.next;
        }
        return result;
    }
}
exports.SortedList = SortedList;
//# sourceMappingURL=sorted-list.js.map