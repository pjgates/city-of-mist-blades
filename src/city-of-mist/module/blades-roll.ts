import { CityDB } from "./city-db.js";
import { CityHelpers } from "./city-helpers.js";
import { CityItem } from "./city-item.js";
import { CityRoll } from "./city-roll.js";
import { MistRoll, RollModifier } from "./mist-roll.js";

export class BladesRoll extends CityRoll {
    protected override async getRoll() {
        const options = this.options;
        let { power } = BladesRoll.getPower(options);
        // Always roll at least 2 dice, so that if power is less than 1, we can keep the lowest
        const maxPower = Math.max(BladesRoll.getMaxPower(options));

        // In Blades, if power is less than 1, roll 2d6 and keep the lowest
        let rstring;
        if (power >= 1) {
            // Roll maximum power (without negatives);
            // We'll remove the negatives later
            rstring = `${maxPower}d6`;
        } else {
            // Roll 2d6 and keep the lowest
            rstring = `2d6kl1`;
        }

        const move = CityDB.getMoveById(this.moveId);
        if (!move) {
            throw new Error(`No Move found for Id: ${this.moveId}`);
        }

        let r = new MistRoll(
            rstring,
            {},
            {
                ...this.options,
                modifiers: this.modifiers,
                tags: this.tags,
                actorId: this.actor?.id,
                moveId: this.moveId,
                canCreateTags: move.canCreateTags(),
            },
        );
        r = await r.roll();
        if (r.total == null || Number.isNaN(r.total)) {
            console.error(r);
            throw new Error("Null Total");
        }
        this.roll = r;
    }

    static override getPower(
        rollOptions: Partial<MistRoll["options"]>,
        modifiers: {
            strikeout?: boolean;
            amount: number;
        }[] = rollOptions.modifiers!,
    ) {
        const { power } = this.getRollPower(rollOptions, modifiers);
        return { power, adjustment: 0 };
    }

    static getMaxPower(rollOptions: Partial<MistRoll["options"]>) {
        const modifiers = rollOptions.modifiers;
        if (!modifiers) {
            return 0;
        }

        const maxPower = modifiers
            .filter((x) => x.amount > 0)
            .reduce((acc, x) => acc + x.amount, 0);

        return maxPower;
    }

    static override getTotal(roll: MistRoll, diceLimit?: number) {
        let { diceResults, isKeepLowest } = BladesRoll.extractResults(roll);

        if (diceLimit !== undefined) {
            if (diceLimit <= 0) {
                diceLimit = 2;
                isKeepLowest = true;
            }
            if (diceLimit < diceResults.length) {
                diceResults = diceResults.slice(0, diceLimit);
            }
        }

        let total;
        if (isKeepLowest) {
            total = Math.min(...diceResults);
        } else {
            total = Math.max(...diceResults);
        }

        return { total, roll_adjustment: 0 };
    }

    static extractResults(roll: MistRoll) {
        const dice = roll.dice[0];
        const diceResults = dice.results.map((d) => d.result);
        const isKeepLowest = roll.formula.includes("kl");
        return {
            diceResults,
            isKeepLowest,
        };
    }

    static override getRollStatus(
        roll: MistRoll,
        total: number,
        options: Partial<MistRoll["options"]>,
    ) {
        const { diceResults, isKeepLowest } = BladesRoll.extractResults(roll);

        if (isKeepLowest) {
            if (total === 6) {
                return "Success";
            } else if (total >= 4) {
                return "Partial";
            } else {
                return "Failure";
            }
        } else {
            const numSixes = diceResults.filter((d) => d === 6).length;
            if (numSixes >= 2 && options.dynamiteAllowed) {
                return "Dynamite";
            } else if (total === 6) {
                return "Success";
            } else if (total >= 4) {
                return "Partial";
            } else {
                return "Failure";
            }
        }
    }

    static truncateResults(
        results: { result: number; active: boolean }[],
        power: number,
    ) {
        // If power is less than 1, truncate to 2
        if (power < 1) {
            return results.slice(0, 2);
        }
        // If power is greater than the length of the results, return the results as is
        if (results.length <= power) {
            return results;
        }
        // Otherwise, truncate the results to the power
        return [...results].slice(0, power);
    }

    /** Takes a foundry roll and an options object containing
	{moveList ?: { see generateMoveList function} }
	*/
    static override async _getContent(
        roll: MistRoll,
        otherOptions: Record<string, unknown> = {},
    ) {
        const modifiers = (roll.options.modifiers as RollModifier[]).map(
            (x) => {
                return {
                    id: x.id,
                    type: x.type,
                    amount: x.amount,
                    subtype: x.subtype,
                    name: x.name,
                    strikeout: x.strikeout,
                    description: x.description,
                    ownerId: x.ownerId,
                    tokenId: x.tokenId,
                };
            },
        );
        const options = roll.options;
        const { power, adjustment } = BladesRoll.getPower(options);
        const moveList = otherOptions?.moveList ?? null;
        const moveId = roll.options.moveId;
        const move = CityHelpers.getMoves().find((x) => x.id == moveId)!;

        // TODO: Truncate the roll to be equal to the power
        //@ts-ignore
        const rolls = BladesRoll.truncateResults(roll.terms[0].results, power);

        const { total, roll_adjustment } = BladesRoll.getTotal(roll, power);
        const roll_status = BladesRoll.getRollStatus(roll, total, options);

        const moveListRaw = CityItem.generateMoveList(
            move!,
            roll_status,
            power,
        ).map((x) => {
            x.checked = false;
            return x;
        });

        const actor = CityDB.getActorById(options.actorId!);

        const templateData = {
            modifiers,
            actorName: actor ? actor.name : "",
            moveId: roll.options.moveId,
            options: roll.options,
            moveList: moveList ?? moveListRaw,
            moveName: move.getDisplayedName(),
            move,
            createTagButton:
                roll_status != "Failure" &&
                move.system.abbreviation == "CHANGE",
            moveText: CityItem.generateMoveText(move, roll_status, power),
            //@ts-ignore
            rolls: rolls,
            total: total,
            roll,
            // Displayed value
            power: power,
            powerAdjustment: adjustment,
            rollAdjustment: roll_adjustment,
        };

        return await renderTemplate(
            "systems/city-of-mist/templates/city-roll.hbs",
            templateData,
        );
    }
}
