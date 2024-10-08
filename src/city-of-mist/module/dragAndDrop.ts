import { STATUS_CATEGORIES } from "./config/status-categories.js";
import { StatusCreationOptions } from "./config/statusDropTypes.js";
import { HTMLHandlers } from "./universal-html-handlers.js";
import { CityDialogs } from "./city-dialogs.js";
import { SceneTags } from "./scene-tags.js";
import { GMMoveOptions } from "./datamodel/item-types.js";
import { CityDB } from "./city-db.js";
import { CityActor } from "./city-actor.js";
import { CityHelpers } from "./city-helpers.js";
import { TagCreationOptions } from "./config/statusDropTypes.js";

export class DragAndDrop {

	static init() {
	}

	static async dropStatusOnActor(statusName: string, actor: CityActor, options : StatusCreationOptions) {
		// const protostatus = await CityHelpers.parseStatusString(textStatus);
		await actor.sheet.statusDrop(statusName , options);
	}

	static async dropTagOnActor(textTag: string, actor: CityActor, options : TagCreationOptions = {}) {
		await actor.createStoryTag(textTag, true, options);
	}

	static getDraggableType(draggable: JQuery) {
		return draggable.data("draggableType") as "status" | "tag" | "gmmove" | "threat";
	}

	static async dropDraggableOnSceneTags (draggable: JQuery) {
		if (!game.user.isGM) return;
		const draggableType = DragAndDrop.getDraggableType(draggable);
		const options = draggable.data("options") ?? {};
		switch ( draggableType ) {
			case "status":
				// const protoStatus = await CityHelpers.parseStatusString(draggable.text());
				const name = draggable.data("name") ?? "name unknown";
				await SceneTags.statusDrop(name, options);
				break;
			case "tag":
					await SceneTags.createSceneTag(draggable.text(), true, options);
				break;
			case "gmmove":
			case "threat":
				break;
			default:
				draggableType satisfies never;
				break;
		}
	}

	static async dropDraggableOnActor(draggable: JQuery, actor: CityActor) {
		if (!actor.isOwner) return;
		let options = draggable.data("options") ?? {};
		const draggableType = DragAndDrop.getDraggableType(draggable);
		const name = draggable.data("name") ?? "name unknown";
		switch (draggableType) {
			case "status":{
				DragAndDrop.dropStatusOnActor(name, actor, options);
				break;
			}
			case "tag": {
				DragAndDrop.dropTagOnActor(name, actor, options);
				break;
			}
			case "gmmove":
				const move_id= draggable.data("moveId");
				const owner_id = draggable.data("ownerId");
				if (owner_id == actor.id)
					return; // can't add a move on actor that already has it
				const owner = CityDB.getActorById(owner_id) as CityActor;
				const move = owner.getGMMove(move_id);
				if (!move)
					throw new Error(`Couldn't find move Id ${move_id} in ${owner_id}`);
				await actor.createNewGMMove(move.name, move.system);
				//TODO: make draggable GM moves
				break;
			case "threat":

				break;
			default:
				draggableType satisfies never;
				console.warn(`Unknown draggableType: ${draggableType}`);
		}
	}

	static async statusDrop(actor: CityActor, name:string, options: StatusCreationOptions) {
		const tier = options.tier;
		if (!tier)
			throw new Error(`Tier is not valid ${tier}`);
		const retval = await CityDialogs.statusDropDialog(actor, name, {...options, tier});
		if (retval == null) return null;
		switch (retval.action) {
			case 'create':
				const status = await actor.addOrCreateStatus(retval.name,{ ...options, tier: retval.tier, pips: retval.pips});
				await CityHelpers.modificationLog(actor, "Created", status, `tier  ${retval.tier}`);
				return status;
			case 'merge':
				const origStatus =   actor.getStatus(retval.statusId!)!;
				options.newName = retval.name;
				await origStatus.addStatus(retval.tier, options);
				await HTMLHandlers.reportStatusAdd(actor, retval.tier,  {name: origStatus.name, tier: origStatus.system.tier,pips: origStatus.system.pips}, origStatus);
				return origStatus;
			default:
				retval.action satisfies never;
				throw new Error(`Unknown action : ${retval.action}`);
		}
	}

	static async addDragFunctionality(html: JQuery) {
		html.find('.draggable').on("dragstart", DragAndDrop.dragStart);
		html.find('.draggable').on("dragend", DragAndDrop.dragEnd);
	}

	static async dragStart(event: JQuery.DragStartEvent) {
		event.stopPropagation();
		$(event.currentTarget!).addClass("dragging");
		return true;
	}

	static async dragEnd(event: JQuery.DragEndEvent) {
		event.stopPropagation();
		$(event.currentTarget!).removeClass("dragging");
		return true;
	}

	static initCanvasDropping() {
		//@ts-ignore
		const old = DragDrop.prototype._handleDrop;
		//@ts-ignore
		DragDrop.prototype._handleDrop = function(event) {
			const dragged = $(document).find(".dragging");
			if (dragged.length == 0) {
				old.call(this, event);
				return;
			}
			event.preventDefault();
			const {clientX:x,clientY :y} = event;
			//@ts-ignore
			const {x: evX, y: evY} = canvas.canvasCoordinatesFromClient({x,y})
			//@ts-ignore
			const tokens = canvas.tokens.children[0].children;
			const token = tokens.find( (tok: Token<CityActor>) => {
				//@ts-ignore
				const {x, y, width, height} = tok.bounds;
				if (evX >= x && evX <x+width
					&& evY >= y && evY <y+height)
					return true;
				return false;
			});
			if (!token) return;
			const actor = token.document.actor;
			DragAndDrop.dropDraggableOnActor(dragged, actor);

		}
	}

	static htmlDraggableStatus(name: string, options: GMMoveOptions & StatusCreationOptions) {
		const tier = options.tier;
		let nameExtra = "";
		const autoStatus = options.autoApply ? "auto-status" : "";
		nameExtra += (options.category && options.category != "none") ? game.i18n.localize(STATUS_CATEGORIES[options.category])  : "";
		const nameParens = nameExtra.length ? `(${nameExtra})`: "";
		return `<span draggable="true" class="narrated-status-name draggable ${autoStatus}" data-draggable-type="status" data-name='${name}' data-tier='${tier}' data-options='${JSON.stringify(options)}'>${name}-<span class="status-tier">${tier} ${nameParens}</span></span>`;
	}

	static htmlDraggableTag(name: string, options: GMMoveOptions & TagCreationOptions) {
		return `<span draggable="true" class="narrated-story-tag draggable" data-name='${name}' data-draggable-type="tag" data-options='${JSON.stringify(options)}'>${name}</span>`;
	}

}

DragAndDrop.initCanvasDropping();

Hooks.on("canvasReady", DragAndDrop.init);


//@ts-ignore
window.DragAndDrop = DragAndDrop;


