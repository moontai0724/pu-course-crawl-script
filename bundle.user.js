// ==UserScript==
// @name         PU Course Parser
// @namespace    https://github.com/moontai0724
// @version      2.1.0
// @description  A parser for PU Course page.
// @author       moontai0724
// @match        https://alcat.pu.edu.tw/2011courseAbstract/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @supportURL   https://github.com/moontai0724/pu-course-crawl-script
// @license      MIT
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/utils/weekday-time-place-parser.ts
/* harmony default export */ const weekday_time_place_parser = ({ parseAll, getPlaces });
function parseAll(input) {
    const days = input.split("\n");
    return days.map(parseDay).flat();
}
function parseDay(input) {
    const chineseWeekday = input.substring(0, 1);
    const timeAndPlaces = input.substring(1).trim().split(";");
    const timePlaces = timeAndPlaces.map(parseTimeAndPlace).flat();
    return timePlaces.map(timePlace => (Object.assign({ weekday: WeekdayMap[chineseWeekday] }, timePlace)));
}
var WeekdayMap;
(function (WeekdayMap) {
    WeekdayMap["\u4E00"] = "MONDAY";
    WeekdayMap["\u4E8C"] = "TUESDAY";
    WeekdayMap["\u4E09"] = "WEDNESDAY";
    WeekdayMap["\u56DB"] = "THURSDAY";
    WeekdayMap["\u4E94"] = "FRIDAY";
    WeekdayMap["\u516D"] = "SATURDAY";
    WeekdayMap["\u65E5"] = "SUNDAY";
})(WeekdayMap || (WeekdayMap = {}));
function parseTimeAndPlace(input) {
    const [rawTimes, place] = input.split("：");
    const times = rawTimes.split("、");
    return times
        .map(time => ({
        time: convertTime(time.trim()),
        place,
    }))
        .filter(({ time }) => time !== null);
}
function convertTime(time) {
    if (!time)
        return null;
    if (time === "午")
        return {
            start: "12:10",
            end: "13:00",
        };
    const index = parseInt(time, 10) - 1;
    const times = [
        ["08:10", "09:00"],
        ["09:10", "10:00"],
        ["10:10", "11:00"],
        ["11:10", "12:00"],
        ["13:10", "14:00"],
        ["14:10", "15:00"],
        ["15:10", "16:00"],
        ["16:10", "17:00"],
        ["17:10", "18:00"],
        ["18:10", "19:00"],
        ["19:10", "20:00"],
        ["20:10", "21:00"],
        ["21:10", "22:00"],
        ["22:10", "23:00"],
    ];
    const [start, end] = times[index];
    return { start, end };
}
function getPlaces(input) {
    const weekdayTimePlaces = parseAll(input);
    const places = weekdayTimePlaces
        .map(wtp => wtp.place)
        .filter((place, index, places) => places.indexOf(place) === index);
    return places;
}

;// CONCATENATED MODULE: ./src/data-managers/course.data-manager.ts

const courses = [];
function load() {
    const data = GM_getValue("courses", []);
    data.forEach(item => {
        courses.push(new CourseItem(item));
    });
}
function save() {
    const data = courses.map(course => course.getData());
    GM_setValue("courses", data);
}
function findExisting(course) {
    return courses.find(item => item.getHash() === course.getHash());
}
function add(course) {
    if (courses.length === 0)
        load();
    const existing = findExisting(course);
    if (existing) {
        const persons = course.getPersonElements();
        if (!persons.length)
            return;
        persons.forEach(person => existing.addPersonByElement(person));
        save();
        return;
    }
    courses.push(course);
    save();
}
function toInputData() {
    if (courses.length === 0)
        load();
    return courses.map(course => course.toInputData());
}

;// CONCATENATED MODULE: ./src/data-managers/date-range.data-manager.ts
const dateRanges = [
    {
        uuid: "1d2b127d-82a9-473f-bc87-d658fa00731a",
        name: "112-1",
        description: null,
        startDate: new Date("2023-09-11"),
        endDate: new Date("2024-01-15"),
    },
];
function getInputs() {
    return dateRanges;
}

;// CONCATENATED MODULE: ./src/items/organization.item.ts
class OrganizationItem {
    constructor(input) {
        this.element = null;
        if (input instanceof Element) {
            this.element = input;
            this.basic = this.parseBasic();
            this.setUUID(this.basic.uuid);
        }
        else {
            this.basic = input;
        }
    }
    getData() {
        return this.basic;
    }
    setUUID(uuid) {
        var _a;
        this.basic.uuid = uuid;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.setAttribute("data-uuid", uuid);
    }
    parseBasic() {
        var _a, _b, _c, _d;
        const basic = {
            uuid: "",
            name: "",
            description: null,
        };
        const existingUUID = (_a = this.element) === null || _a === void 0 ? void 0 : _a.getAttribute("data-uuid");
        basic.uuid = existingUUID || crypto.randomUUID();
        basic.name = (_d = (_c = (_b = this.element) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : "";
        return basic;
    }
    getHash() {
        const identicalValues = {
            name: this.basic.name,
        };
        return JSON.stringify(identicalValues);
    }
    toInputData() {
        return this.basic;
    }
}

;// CONCATENATED MODULE: ./src/data-managers/organization.data-manager.ts

const organizations = [];
function organization_data_manager_load() {
    const data = GM_getValue("organizations", []);
    data.forEach(item => {
        organizations.push(new OrganizationItem(item));
    });
}
function organization_data_manager_save() {
    const data = organizations.map(organization => organization.getData());
    GM_setValue("organizations", data);
}
function find(organization) {
    if (organizations.length === 0)
        organization_data_manager_load();
    const hash = organization.getHash();
    const existingOrganization = organizations.find(item => item.getHash() === hash);
    return existingOrganization;
}
function organization_data_manager_add(organization) {
    if (organizations.length === 0)
        organization_data_manager_load();
    const existing = find(organization);
    if (existing) {
        organization.setUUID(existing.basic.uuid);
        return;
    }
    organizations.push(organization);
    organization_data_manager_save();
}
function getByUUID(uuid) {
    if (organizations.length === 0)
        organization_data_manager_load();
    return organizations.find(organization => organization.basic.uuid === uuid);
}
function organization_data_manager_toInputData() {
    if (organizations.length === 0)
        organization_data_manager_load();
    return organizations.map(item => item.toInputData());
}

;// CONCATENATED MODULE: ./src/items/person.item.ts
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
class PersonItem {
    constructor(input) {
        this.element = null;
        this.intervalValues = {};
        if (input instanceof HTMLAnchorElement) {
            this.element = input;
            this.basic = this.parseBasic();
            this.setUUID(this.basic.uuid);
        }
        else {
            const _a = input, { internalValues } = _a, basic = __rest(_a, ["internalValues"]);
            this.basic = basic;
            this.intervalValues = internalValues;
        }
    }
    getData() {
        const data = Object.assign(Object.assign({}, this.basic), { internalValues: this.intervalValues });
        return data;
    }
    setUUID(uuid) {
        var _a;
        this.basic.uuid = uuid;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.setAttribute("data-uuid", uuid);
    }
    parseBasic() {
        var _a, _b, _c, _d, _e, _f;
        // eslint-disable-next-line prefer-const
        let course = {};
        const existingUUID = (_a = this.element) === null || _a === void 0 ? void 0 : _a.getAttribute("data-uuid");
        course.uuid = existingUUID || crypto.randomUUID();
        const link = (_c = (_b = this.element) === null || _b === void 0 ? void 0 : _b.href) === null || _c === void 0 ? void 0 : _c.replace("../", "https://alcat.pu.edu.tw/");
        const name = (_f = (_e = (_d = this.element) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : "";
        course.name = name;
        course.description = null;
        course.link = link;
        this.intervalValues.personId = link === null || link === void 0 ? void 0 : link.split("?").pop();
        return course;
    }
    getHash() {
        const identicalValues = {
            name: this.basic.name,
            link: this.basic.link,
        };
        return JSON.stringify(identicalValues);
    }
    toInputData() {
        return this.basic;
    }
}

;// CONCATENATED MODULE: ./src/data-managers/person.data-manager.ts

const people = [];
function person_data_manager_load() {
    const data = GM_getValue("people", []);
    data.forEach(item => {
        people.push(new PersonItem(item));
    });
}
function person_data_manager_save() {
    const data = people.map(person => person.getData());
    GM_setValue("people", data);
}
function person_data_manager_findExisting(person) {
    if (people.length === 0)
        person_data_manager_load();
    return people.find(item => item.getHash() === person.getHash());
}
function person_data_manager_add(person) {
    if (people.length === 0)
        person_data_manager_load();
    const existing = person_data_manager_findExisting(person);
    if (existing)
        return;
    people.push(person);
    person_data_manager_save();
}
function person_data_manager_getByUUID(uuid) {
    if (people.length === 0)
        person_data_manager_load();
    return people.find(person => person.basic.uuid === uuid);
}
function person_data_manager_toInputData() {
    if (people.length === 0)
        person_data_manager_load();
    return people.map(person => person.toInputData());
}

;// CONCATENATED MODULE: ./src/items/place.item.ts
class PlaceItem {
    constructor(input, element) {
        this.element = null;
        if (typeof input === "string") {
            this.element = element;
            this.basic = this.parseBasic(input);
            this.setUUID(this.basic.uuid);
        }
        else {
            this.basic = input;
        }
    }
    getData() {
        return this.basic;
    }
    getPlaceUUIDs() {
        var _a;
        const rawExistingUUIDs = (_a = this.element) === null || _a === void 0 ? void 0 : _a.getAttribute("data-places");
        const existingUUIDs = JSON.parse(rawExistingUUIDs || "[]");
        return existingUUIDs;
    }
    getPlaceUUID(name) {
        const existingUUIDs = this.getPlaceUUIDs();
        const existingUUID = existingUUIDs.find(uuid => uuid.name === name);
        return existingUUID || null;
    }
    setUUID(uuid) {
        var _a, _b;
        const existingUUIDs = this.getPlaceUUIDs();
        const existingUUIDIndex = existingUUIDs.findIndex(uuid => uuid.name === this.basic.name);
        if (existingUUIDIndex < 0) {
            existingUUIDs.push({ uuid, name: this.basic.name });
            (_a = this.element) === null || _a === void 0 ? void 0 : _a.setAttribute("data-places", JSON.stringify(existingUUIDs));
        }
        existingUUIDs[existingUUIDIndex] = { uuid, name: this.basic.name };
        this.basic.uuid = uuid;
        (_b = this.element) === null || _b === void 0 ? void 0 : _b.setAttribute("data-places", JSON.stringify(existingUUIDs));
    }
    parseBasic(text) {
        const basic = {
            uuid: "",
            name: text,
            description: null,
        };
        basic.name = text;
        const existingUUID = this.getPlaceUUID(text);
        basic.uuid = (existingUUID === null || existingUUID === void 0 ? void 0 : existingUUID.uuid) || crypto.randomUUID();
        return basic;
    }
    getHash() {
        const identicalValues = {
            name: this.basic.name,
        };
        return JSON.stringify(identicalValues);
    }
    toInputData() {
        return this.basic;
    }
}

;// CONCATENATED MODULE: ./src/data-managers/place.data-manager.ts


const places = [];
(function () {
    const data = GM_getValue("places", []);
    data.forEach(item => {
        place_data_manager_add(new PlaceItem(item));
    });
})();
function place_data_manager_save() {
    const data = places.map(place => place.getData());
    GM_setValue("places", data);
}
function parse(tdElement) {
    if (!tdElement)
        return [];
    const places = [];
    const text = tdElement.innerText || "";
    const placeTexts = weekday_time_place_parser.getPlaces(text);
    placeTexts.forEach(placeText => {
        const place = new PlaceItem(placeText, tdElement);
        place_data_manager_add(place);
        places.push(place);
    });
    return places;
}
function place_data_manager_findExisting(place) {
    return places.find(item => item.getHash() === place.getHash());
}
function place_data_manager_add(place) {
    const existing = place_data_manager_findExisting(place);
    if (existing) {
        place.setUUID(existing.basic.uuid);
        return;
    }
    places.push(place);
    place_data_manager_save();
}
function place_data_manager_getByUUID(uuid) {
    return places.find(place => place.basic.uuid === uuid);
}
function place_data_manager_toInputData() {
    return places.map(place => place.toInputData());
}

;// CONCATENATED MODULE: ./src/items/time-range.item.ts
class TimeRangeItem {
    constructor(input, element) {
        this.element = null;
        if (input.time) {
            this.element = element;
            this.basic = this.parseBasic(input);
        }
        else {
            this.basic = input;
        }
    }
    getData() {
        return this.basic;
    }
    setId(id) {
        this.basic.id = id;
        this.updateToElement(id);
    }
    parseAllFromElement() {
        var _a;
        if (!this.element)
            return [];
        const timeRangeInfos = (_a = this.element) === null || _a === void 0 ? void 0 : _a.getAttribute("data-time-ranges");
        const timeRangeInfosParsed = JSON.parse(timeRangeInfos || "[]");
        return timeRangeInfosParsed;
    }
    updateToElement(id) {
        const existing = this.parseAllFromElement();
        let existingIndex = existing.findIndex(info => info.hash === this.getHash());
        if (existingIndex < 0)
            existingIndex = existing.length;
        existing[existingIndex] = { id, hash: this.getHash() };
        this.saveToElement(existing);
    }
    saveToElement(data) {
        if (!this.element)
            return;
        this.element.setAttribute("data-time-ranges", JSON.stringify(data));
    }
    parseBasic(wtp) {
        const basic = {
            weekday: wtp.weekday,
            startTime: wtp.time.start,
            endTime: wtp.time.end,
        };
        return basic;
    }
    getHash() {
        const identicalValues = {
            weekday: this.basic.weekday,
            startTime: this.basic.startTime,
            endTime: this.basic.endTime,
        };
        return `${identicalValues.weekday} ${identicalValues.startTime}-${identicalValues.endTime}`;
    }
    toInputData() {
        return this.basic;
    }
}

;// CONCATENATED MODULE: ./src/data-managers/time.data-manager.ts


const times = [];
function time_data_manager_load() {
    const data = GM_getValue("times", []);
    data.forEach((item, index) => {
        var _a;
        const id = (_a = item.id) !== null && _a !== void 0 ? _a : index;
        times.push(new TimeRangeItem(Object.assign({ id }, item)));
    });
}
function time_data_manager_save() {
    const data = times.map(time => time.getData());
    GM_setValue("times", data);
}
function time_data_manager_parse(tdElement) {
    var _a;
    if (!tdElement)
        return [];
    const parsed = [];
    const text = ((_a = tdElement.innerText) === null || _a === void 0 ? void 0 : _a.trim()) || "";
    const wtps = weekday_time_place_parser.parseAll(text);
    wtps.forEach(wtp => {
        const item = new TimeRangeItem(wtp, tdElement);
        item.setId(times.length + 1);
        time_data_manager_add(item);
        parsed.push(item);
    });
    return parsed;
}
function time_data_manager_findExisting(time) {
    if (times.length === 0)
        time_data_manager_load();
    return times.find(item => item.getHash() === time.getHash());
}
function time_data_manager_add(time) {
    if (times.length === 0)
        time_data_manager_load();
    const existing = time_data_manager_findExisting(time);
    if (existing && existing.basic.id) {
        time.setId(existing.basic.id);
        return;
    }
    times.push(time);
    time_data_manager_save();
}
function time_data_manager_toInputData() {
    if (times.length === 0)
        time_data_manager_load();
    return times.map(time => time.toInputData());
}

;// CONCATENATED MODULE: ./src/items/tag.item.ts
class TagItem {
    constructor(input) {
        if (typeof input === "string") {
            this.basic = this.parseBasic(input);
            this.setUUID(this.basic.uuid);
        }
        else {
            this.basic = input;
        }
    }
    getData() {
        return this.basic;
    }
    setUUID(uuid) {
        this.basic.uuid = uuid;
    }
    parseBasic(text) {
        const basic = {
            uuid: "",
            name: text,
            description: null,
        };
        basic.uuid = crypto.randomUUID();
        return basic;
    }
    getHash() {
        const identicalValues = {
            name: this.basic.name,
        };
        return JSON.stringify(identicalValues);
    }
    toInputData() {
        return this.basic;
    }
}

;// CONCATENATED MODULE: ./src/data-managers/tag.data-manager.ts

const tags = [];
function tag_data_manager_load() {
    const data = GM_getValue("tags", []);
    data.forEach(item => {
        tags.push(new TagItem(item));
    });
}
function tag_data_manager_save() {
    const data = tags.map(tag => tag.getData());
    GM_setValue("tags", data);
}
function tag_data_manager_find(tag) {
    if (tags.length === 0)
        tag_data_manager_load();
    const hash = tag.getHash();
    const existingTag = tags.find(item => item.getHash() === hash);
    return existingTag;
}
function tag_data_manager_add(tag) {
    if (tags.length === 0)
        tag_data_manager_load();
    const existing = tag_data_manager_find(tag);
    if (existing) {
        tag.setUUID(existing.basic.uuid);
        return;
    }
    tags.push(tag);
    tag_data_manager_save();
}
function tag_data_manager_getByUUID(uuid) {
    if (tags.length === 0)
        tag_data_manager_load();
    return tags.find(tag => tag.basic.uuid === uuid);
}
function tag_data_manager_toInputData() {
    if (tags.length === 0)
        tag_data_manager_load();
    return tags.map(item => item.toInputData());
}

;// CONCATENATED MODULE: ./src/data-managers/index.ts















;// CONCATENATED MODULE: ./src/utils/person-parser.ts


/* harmony default export */ const person_parser = ({ parseAll: person_parser_parseAll });
function person_parser_parseAll(tdElement) {
    var _a;
    const persons = [];
    const aElements = tdElement === null || tdElement === void 0 ? void 0 : tdElement.querySelectorAll("a");
    aElements === null || aElements === void 0 ? void 0 : aElements.forEach(aElement => {
        const person = new PersonItem(aElement);
        person_data_manager_add(person);
        persons.push(person);
    });
    const textContent = (_a = tdElement === null || tdElement === void 0 ? void 0 : tdElement.textContent) === null || _a === void 0 ? void 0 : _a.trim();
    if (!persons.length && textContent && textContent != "") {
        const person = {
            uuid: crypto.randomUUID(),
            name: textContent,
            description: null,
            link: null,
            internalValues: {},
        };
        persons.push(new PersonItem(person));
    }
    return persons;
}

;// CONCATENATED MODULE: ./src/items/course.item.ts
var course_item_rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};






class CourseItem {
    constructor(input) {
        this.element = null;
        this.internalValues = {};
        if (input instanceof Element) {
            this.element = input;
            this.basic = this.parseBasic();
            this.setUUID(this.basic.uuid);
        }
        else {
            const _a = input, { internalValues } = _a, basic = course_item_rest(_a, ["internalValues"]);
            this.basic = basic;
            this.internalValues = internalValues;
        }
    }
    addPlace(place) {
        this.internalValues.places = this.internalValues.places || [];
        this.internalValues.places.push(place);
    }
    addTimeRange(timeRange) {
        this.internalValues.timeRanges = this.internalValues.timeRanges || [];
        this.internalValues.timeRanges.push(timeRange);
    }
    addTag(tag) {
        this.internalValues.tags = this.internalValues.tags || [];
        this.internalValues.tags.push(tag);
    }
    addPersonByElement(personElement) {
        var _a;
        const person = new PersonItem(personElement);
        this.internalValues.persons = this.internalValues.persons || [];
        this.internalValues.persons.push(person);
        const personContainer = (_a = this.element) === null || _a === void 0 ? void 0 : _a.querySelector("td:nth-child(7)");
        const element = person.element;
        if (!personContainer || !element)
            return;
        personContainer.appendChild(element);
    }
    getData() {
        const internalValues = {};
        for (const [key, value] of Object.entries(this.internalValues)) {
            if (value instanceof Array) {
                internalValues[key] = value.map((_a) => {
                    var { element } = _a, item = course_item_rest(_a, ["element"]);
                    return item;
                });
            }
            else if (value instanceof Object) {
                const { element } = value, item = course_item_rest(value, ["element"]);
                internalValues[key] = item;
            }
            else {
                internalValues[key] = value;
            }
        }
        const data = Object.assign(Object.assign({}, this.basic), { internalValues });
        return data;
    }
    setUUID(uuid) {
        var _a;
        this.basic.uuid = uuid;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.setAttribute("data-uuid", uuid);
    }
    parseBasic() {
        var _a;
        // eslint-disable-next-line prefer-const
        let course = {};
        const existingUUID = (_a = this.element) === null || _a === void 0 ? void 0 : _a.getAttribute("data-uuid");
        course.uuid = existingUUID || crypto.randomUUID();
        course.code = this.parseCode();
        this.internalValues.organization = this.parseOrganization();
        this.internalValues.typeName = this.parseTypeName();
        const { chinese, english, link } = this.parseName();
        const note = this.parseNote();
        course.name = chinese;
        course.description = [english, note].filter(Boolean).join("\n");
        course.link = link;
        course.credit = this.parseCredit();
        this.internalValues.persons = this.parsePerson();
        this.internalValues.weekTimePlaces = this.parseWeekTimePlaces();
        this.internalValues.places = this.parsePlaces();
        this.internalValues.timeRanges = this.parseTimeRanges();
        const type = this.parseType();
        if (type)
            this.addTag(type);
        return course;
    }
    getHash() {
        var _a;
        const identicalValues = {
            code: this.basic.code,
            name: this.basic.name,
            credit: this.basic.credit,
            organization: (_a = this.internalValues.organization) === null || _a === void 0 ? void 0 : _a.basic.uuid,
            weekTimePlaces: this.internalValues.weekTimePlaces,
        };
        return JSON.stringify(identicalValues);
    }
    parseCode() {
        var _a, _b, _c;
        const element = (_a = this.element) === null || _a === void 0 ? void 0 : _a.querySelector("td:nth-child(1)");
        return (_c = (_b = element === null || element === void 0 ? void 0 : element.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
    }
    parseOrganization() {
        var _a;
        const element = (_a = this.element) === null || _a === void 0 ? void 0 : _a.querySelector("td:nth-child(2)");
        if (!element)
            return null;
        const organization = new OrganizationItem(element);
        organization_data_manager_add(organization);
        return organization;
    }
    parseType() {
        const name = this.parseTypeName();
        if (!name)
            return null;
        const tag = new TagItem(name);
        tag_data_manager_add(tag);
        return tag;
    }
    parseTypeName() {
        var _a, _b;
        const element = (_a = this.element) === null || _a === void 0 ? void 0 : _a.querySelector("td:nth-child(3)");
        return ((_b = element === null || element === void 0 ? void 0 : element.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || null;
    }
    parseName() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const element = (_a = this.element) === null || _a === void 0 ? void 0 : _a.querySelector("td:nth-child(4)");
        if (!element) {
            console.error("Cannot find title element in: ", this.element);
            throw new Error("Cannot find title element");
        }
        const linkElement = element === null || element === void 0 ? void 0 : element.querySelector("a");
        if (!linkElement) {
            return {
                chinese: (_c = (_b = element === null || element === void 0 ? void 0 : element.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "",
                english: null,
                link: null,
            };
        }
        const chinese = (_e = (_d = linkElement.textContent) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : "";
        const english = (_h = (_g = (_f = Array.from(element.childNodes).pop()) === null || _f === void 0 ? void 0 : _f.textContent) === null || _g === void 0 ? void 0 : _g.trim()) !== null && _h !== void 0 ? _h : null;
        const link = (_j = linkElement.getAttribute("href")) !== null && _j !== void 0 ? _j : null;
        return { chinese, english, link };
    }
    parseCredit() {
        var _a, _b;
        const element = (_a = this.element) === null || _a === void 0 ? void 0 : _a.querySelector("td:nth-child(6)");
        return parseInt(((_b = element === null || element === void 0 ? void 0 : element.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || "0", 10);
    }
    getPersonElements() {
        if (!this.element)
            throw new Error("Cannot find element");
        const elements = this.element.querySelectorAll("td:nth-child(7) a");
        return Array.from(elements);
    }
    parsePerson() {
        var _a;
        const element = (_a = this.element) === null || _a === void 0 ? void 0 : _a.querySelector("td:nth-child(7)");
        return person_parser.parseAll(element);
    }
    parseTimeRanges() {
        var _a;
        const element = (_a = this.element) === null || _a === void 0 ? void 0 : _a.querySelector("td:nth-child(8)");
        return time_data_manager_parse(element);
    }
    parseWeekTimePlaces() {
        var _a, _b;
        const element = (_a = this.element) === null || _a === void 0 ? void 0 : _a.querySelector("td:nth-child(8)");
        const text = ((_b = element.innerText) === null || _b === void 0 ? void 0 : _b.trim()) || "";
        const weekTimePlaces = weekday_time_place_parser.parseAll(text);
        return weekTimePlaces;
    }
    parsePlaces() {
        var _a;
        const element = (_a = this.element) === null || _a === void 0 ? void 0 : _a.querySelector("td:nth-child(8)");
        return parse(element);
    }
    parseNote() {
        var _a, _b;
        const element = (_a = this.element) === null || _a === void 0 ? void 0 : _a.querySelector("td:nth-child(9)");
        return ((_b = element === null || element === void 0 ? void 0 : element.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || null;
    }
    toInputData() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const inputWithRelations = Object.assign(Object.assign({}, this.basic), { organization: undefined, dateRange: {
                connect: { uuid: "1d2b127d-82a9-473f-bc87-d658fa00731a" },
            }, hosts: undefined, places: undefined, tags: undefined, timeRanges: undefined });
        if (this.internalValues.organization)
            inputWithRelations.organization = {
                connect: { uuid: (_a = this.internalValues.organization) === null || _a === void 0 ? void 0 : _a.basic.uuid },
            };
        if ((_b = this.internalValues.persons) === null || _b === void 0 ? void 0 : _b.length)
            inputWithRelations.hosts = {
                connect: (_c = this.internalValues.persons) === null || _c === void 0 ? void 0 : _c.map(person => ({
                    uuid: person.basic.uuid,
                })),
            };
        if ((_d = this.internalValues.places) === null || _d === void 0 ? void 0 : _d.length)
            inputWithRelations.places = {
                connect: (_e = this.internalValues.places) === null || _e === void 0 ? void 0 : _e.map(place => ({
                    uuid: place.basic.uuid,
                })),
            };
        if ((_f = this.internalValues.tags) === null || _f === void 0 ? void 0 : _f.length)
            inputWithRelations.tags = {
                connect: (_g = this.internalValues.tags) === null || _g === void 0 ? void 0 : _g.map(tag => ({
                    uuid: tag.basic.uuid,
                })),
            };
        if ((_h = this.internalValues.timeRanges) === null || _h === void 0 ? void 0 : _h.length)
            inputWithRelations.timeRanges = {
                connect: (_j = this.internalValues.timeRanges) === null || _j === void 0 ? void 0 : _j.map(timeRange => ({
                    id: timeRange.basic.id,
                })),
            };
        return inputWithRelations;
    }
}

;// CONCATENATED MODULE: ./src/index.ts



GM_registerMenuCommand("Downlaod All", function () {
    const oDateRange = getInputs();
    const oOrganization = organization_data_manager_toInputData();
    const oPerson = person_data_manager_toInputData();
    const oPlace = place_data_manager_toInputData();
    const oTime = time_data_manager_toInputData();
    const oTag = tag_data_manager_toInputData();
    const oCourse = toInputData();
    console.log("DateRange data", oDateRange);
    console.log("Organization data", oOrganization);
    console.log("Person data", oPerson);
    console.log("Place data", oPlace);
    console.log("Time data", oTime);
    console.log("Tag data", oTag);
    console.log("Course data", oCourse);
    download("courses.json", JSON.stringify(oCourse));
    download("dateRanges.json", JSON.stringify(oDateRange));
    download("organizations.json", JSON.stringify(oOrganization));
    download("persons.json", JSON.stringify(oPerson));
    download("places.json", JSON.stringify(oPlace));
    download("timeRanges.json", JSON.stringify(oTime));
    download("tags.json", JSON.stringify(oTag));
}, "a");
function download(filename, text) {
    const element = document.createElement("a");
    element.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
const selectedTagElement = document.querySelector("select[name=classattri] option[selected]");
const tag = (selectedTagElement === null || selectedTagElement === void 0 ? void 0 : selectedTagElement.textContent)
    ? new TagItem(selectedTagElement === null || selectedTagElement === void 0 ? void 0 : selectedTagElement.textContent)
    : null;
if (tag)
    tag_data_manager_add(tag);
const courseElements = document.querySelectorAll("table tr");
Array.from(courseElements)
    .slice(1)
    .forEach(courseElement => {
    const course = new CourseItem(courseElement);
    if (tag)
        course.addTag(tag);
    add(course);
});
alert("Done");

/******/ })()
;