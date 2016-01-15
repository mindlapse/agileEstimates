"use strict"

let settings = require("../../settings.json");

class GroupEstimate {

    constructor(ticketId, ticketName, viewerUserId, frozen, added) {
        this._ticketId       = ticketId
        this._ticketName     = ticketName
        this._users          = new Set()
        this._total          = 0
        this._numEstimates   = 0
        this._owner          = 0
        this._viewer         = viewerUserId
        this._frozen         = frozen
        this._added          = added
    }

    addEstimate(fbId, userName, estimate) {
        this._users.add({fbId, userName, estimate})
        this._total += estimate
        this._numEstimates++
    }

    get ticketId() {
        return this._ticketId
    }

    get ticketName() {
        return this._ticketName
    }

    get users() {
        let userList = [...this._users.values()]

        // Remove individual estimates if there are not enough.
        if (!this.haveEnoughEstimates()) {
            for (let user of userList) {
                delete user.estimate
            }
        }
        return userList
    }

    get frozen() {
        return this._frozen == 'Y'
    }

    set owner(userId) {
        this._owner = userId
    }

    get estimate() {

        return this.haveEnoughEstimates() ? this._total / this._numEstimates : null
    }

    get added() {
        return this._added
    }

    haveEnoughEstimates() {
        return this.frozen
        // console.log("Estimates needed" + settings.estimatesNeeded);
        // return this._numEstimates >= settings.estimatesNeeded;
    }

    /**
     * Converts a Map<someKey, GroupEstimate> to a [GroupEstimate.toObject()]
     * @param groupEstimateMap
     */
    static toList(groupEstimateMap) {
        function* g1() {
            for (let ge of groupEstimateMap.values()) {
                yield ge.toObject()
            }
        }
        console.log([...g1()])
        let unsorted    = [...g1()];
        let sorted = unsorted.sort(function (a, z) {
            console.log(a.added.getTime());
            return z.added.getTime() - a.added.getTime()
        });
        console.log("Sorted");
        console.dir(sorted);
        return sorted;
    }

    toObject() {
        return {
            id          : this.ticketId,
            name        : this.ticketName,
            estimate    : this.estimate,
            users       : this.users,
            frozen      : this.frozen,
            isOwner     : this._viewer == this._owner,
            added       : this._added
        }
    }
}

module.exports = GroupEstimate