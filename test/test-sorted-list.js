"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expect = require("expect");
const sorted_list_1 = require("../src/data-structures/sorted-list");
describe("sorted-list", function () {
    it("works correctly with max items 3", function () {
        const list = new sorted_list_1.SortedList(3);
        list.addItem({ weight: 5 });
        expect(list.getItems()).toEqual([{ weight: 5 }]);
        list.addItem({ weight: 3 });
        expect(list.getItems()).toEqual([{ weight: 3 }, { weight: 5 }]);
        list.addItem({ weight: 7 });
        expect(list.getItems()).toEqual([{ weight: 3 }, { weight: 5 }, { weight: 7 }]);
        list.addItem({ weight: 2 });
        expect(list.getItems()).toEqual([{ weight: 3 }, { weight: 5 }, { weight: 7 }]);
        list.addItem({ weight: 12 });
        expect(list.getItems()).toEqual([{ weight: 5 }, { weight: 7 }, { weight: 12 }]);
        list.addItem({ weight: 4 });
        expect(list.getItems()).toEqual([{ weight: 5 }, { weight: 7 }, { weight: 12 }]);
        list.addItem({ weight: 10 });
        expect(list.getItems()).toEqual([{ weight: 7 }, { weight: 10 }, { weight: 12 }]);
        list.addItem({ weight: 11 });
        expect(list.getItems()).toEqual([{ weight: 10 }, { weight: 11 }, { weight: 12 }]);
        list.addItem({ weight: 15 });
        expect(list.getItems()).toEqual([{ weight: 11 }, { weight: 12 }, { weight: 15 }]);
        list.addItem({ weight: 15 });
        expect(list.getItems()).toEqual([{ weight: 12 }, { weight: 15 }, { weight: 15 }]);
        list.addItem({ weight: 14 });
        expect(list.getItems()).toEqual([{ weight: 14 }, { weight: 15 }, { weight: 15 }]);
        list.addItem({ weight: 18 });
        expect(list.getItems()).toEqual([{ weight: 15 }, { weight: 15 }, { weight: 18 }]);
        list.addItem({ weight: 18 });
        expect(list.getItems()).toEqual([{ weight: 15 }, { weight: 18 }, { weight: 18 }]);
        list.addItem({ weight: 18 });
        expect(list.getItems()).toEqual([{ weight: 18 }, { weight: 18 }, { weight: 18 }]);
    });
    it("works correctly with max items 1", function () {
        const list = new sorted_list_1.SortedList(1);
        list.addItem({ weight: 5 });
        expect(list.getItems()).toEqual([{ weight: 5 }]);
        list.addItem({ weight: 3 });
        expect(list.getItems()).toEqual([{ weight: 5 }]);
        list.addItem({ weight: 8 });
        expect(list.getItems()).toEqual([{ weight: 8 }]);
    });
});
//# sourceMappingURL=test-sorted-list.js.map