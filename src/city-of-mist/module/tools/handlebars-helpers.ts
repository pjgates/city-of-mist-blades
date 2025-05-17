export class HandlebarsHelpers {

	static init() {
		console.log("Initializing Handlebars Helpers");
		this.addHelpers(this.getObject());
	}

	static addHelpers(helperObj: ReturnType<typeof HandlebarsHelpers["getObject"]>) {
		for (const [key, fn] of Object.entries(helperObj) ) {
			// console.log(`Init helper ${key}`);
			Handlebars.registerHelper(key, fn);
		}
	}

	static getObject() {
		return  {
			'noteq': (a:any, b:any) => {
				return (a !== b);
			},
			'neq': (a : any, b : any) => {
				return (a !== b);
			},

			// Not helper
			'not': (a : any) => {
				return a ? false : true;
			},
			'and': (a : any, b : any) => {
				return a && b;
			},
			'or': (a : any, b : any) => {
				return a || b;
			},
			//concat handler
			'cat': (a : any, b : any) => {
				return a + b;
			},

			"isGM": () => {
				return game.user.isGM;
			},
			"localizeS": (string: string) => {
				return localizeS(string);
			},

		};
	}
} // end of class
export function localizeS(string: string | { string: string }) {
    // If 'string' is an object with a 'string' property, extract it
    if (typeof string === 'object' && string !== null && 'string' in string) {
        string = string.string;
    }
    // Ensure 'string' is now a string before proceeding
    if (typeof string !== 'string') {
        // Handle unexpected types gracefully
        return new Handlebars.SafeString('');
    }
    if (!string.startsWith("#"))
        return new Handlebars.SafeString(string);
    const localizeCode = string.substring(1);
    const localized = game.i18n.localize(localizeCode);
    return new Handlebars.SafeString(localized);
}
