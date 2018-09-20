
export interface IWeighted { 
    weight: number;
}

export class SortedList<T extends IWeighted> { 

    private head: Node<T> | undefined;
    private tail: Node<T> | undefined;

    private size = 0;

    constructor(private maxItemCount: number) { 
    }

    addItem(data: T) {
        
        if (this.head) {

            if (this.size === this.maxItemCount) {
                this.replaceItem(data);

            } else { 
                this.addItemInternal(data);
                this.size++;
            }

        } else { 
            this.head = this.tail = { data };
            this.size = 1;
        }
    }

    getItems(): T[] { 
        const result: T[] = new Array(this.size);

        let item = this.head, i = 0;
        while (item) { 
            result[i++] = item.data;
            item = item.next;
        }

        return result;
    }

    private replaceItem(data: T) { 
        
        const nextLarger = this.findNextLarger(data);

        if (nextLarger === this.head) { 
            return; // data smaller than current smallest
        }

        // remove head
        const secondItem = this.head!.next;
        if (secondItem) {
            secondItem.prev = undefined;
        }

        const newNode: Node<T> = { data };

        if (nextLarger) {

            newNode.next = nextLarger;
            newNode.prev = nextLarger.prev;

            if (nextLarger.prev) { 
                nextLarger.prev.next = newNode;
            }

            nextLarger.prev = newNode;

            this.head = nextLarger === secondItem ? newNode : secondItem;

        } else { 

            if (this.tail !== this.head) {
                this.tail!.next = newNode;
                newNode.prev = this.tail;
            }

            this.head = secondItem || newNode;
            this.tail = newNode;
        }
    }

    private addItemInternal(data: T) { 

        const nextLarger = this.findNextLarger(data);
        const newNode: Node<T> = { data };

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

        } else { 

            this.tail!.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }
    }

    private findNextLarger(data: T): Node<T> | undefined { 
        
        let result: Node<T> | undefined = this.head;

        while (result && result.data.weight <= data.weight) { 
            result = result.next;
        }

        return result;
    }
}

interface Node<T> { 
    data: T;
    next?: Node<T>;
    prev?: Node<T>;
}