interface Modifiers {
	ctrl?: boolean
	shift?: boolean
	alt?: boolean
}
interface Keybinding {
	key: string,
	modifiers: Modifiers,
	action: (event: KeyboardEvent) => void
}
const Keybindings: Keybinding[] = [];


document.addEventListener('keyup', event => {
	let ctrl = event.ctrlKey || event.metaKey;
	let used = false;
	for (let k of Keybindings) {
		if (k.key == event.key && (!!k.modifiers.ctrl == ctrl) && (!!k.modifiers.shift == event.shiftKey) && (!!k.modifiers.alt == event.altKey)) {
			k.action(event);
			used = true;
		}
	}
	if (used) event.preventDefault();
})

export function addKeybinding(key: string, modifiers: Modifiers, action: (event: KeyboardEvent) => void) {
	Keybindings.push({
		key, modifiers, action
	})
}