class GenerationalIndexAllocator {
    constructor() {
        this._generation = 0;
        this._nextFree = 0;
        this._entries = [];
        this._references = [];
    }

    createRef(object) {
        const index = this._nextFree;
        const [isAllocatedSlot, nextFree] = this._entries[index] || [
            false,
            index + 1
        ];
        this._nextFree = nextFree;
        const generation = this._generation++;
        this._entries[index] = [true, generation];
        this._references[index] = object;
        return #{ $ref: true, index, generation };
    }

    removeRef(ref) {
        if (!this.hasRef(ref)) {
            return false;
        }
        this._entries[ref.index] = [false, this._nextFree];
        this._nextFree = this.index;
        delete this._references[ref.index];
        return true;
    }

    hasRef(ref) {
        if (!ref.$ref) {
            throw new Error("Not a Ref");
        }
        const [isAllocated, allocGeneration] = this._entries[ref.index] || [
            false,
            -1
        ];
        return isAllocated && ref.generation === allocGeneration;
    }

    deref(ref) {
        if (!this.hasRef(ref)) {
            return null;
        }
        return this._references[ref.index];
    }
}

const allocator = new GenerationalIndexAllocator();
const clickHandler = () => alert("hey!");
const clickHandlerRef = allocator.createRef(clickHandler);

const vdom = #{
    type: "div",
    children: #[
        #{
            type: "button",
            props: #{
                onClick: clickHandlerRef,
            },
            children: #[
                "Say hey!"
            ],
        },
    ],
};

console.log(vdom);
console.log(allocator.deref(vdom.children[0].props.onClick));

allocator.removeRef(vdom.children[0].props.onClick);

console.log(vdom);
console.log(allocator.deref(vdom.children[0].props.onClick));