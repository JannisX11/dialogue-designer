<template>
	<div id="scene_editor" ref="main" @click="($event.target == $refs.main || $event.target == $refs.dialogue) && setSelectedInput('')">
		<div id="editor_bar_top">

		</div>
		<div id="dialogue" ref="dialogue" :class="{preview_mode: preview_mode}" @dblclick="preview_mode && togglePreviewMode()">
			<div class="dialogue_title text_field" @click="setSelectedInput('npc_name')">
				<template v-if="!preview_mode">
					<input type="text" v-model="scene.npc_name.display_text" spellcheck="false" :readonly="scene.npc_name.mode == 'json'" @click="scene.npc_name.mode == 'json' && editInPopup('npc_name')" />
					<div class="text_field_switcher" v-if="selected_input == 'npc_name'">
						<select :value="scene.npc_name.mode" @change="scene.npc_name.switchMode($event.target.value); $event.target.value == 'json' && editInPopup('npc_name')">
							<option value="text">Text</option>
							<option value="translate">Translate</option>
							<option value="json">Raw JSON</option>
						</select>
					</div>
				</template>
				<minecraft-formatting-preview v-else :text_field="scene.npc_name" />
			</div>
			<div class="dialogue_main_row">
				<div class="portrait_dummy" @click="editInPopup('text')">
					<User />
				</div>
				<div class="dialogue_content text_field" @click="setSelectedInput('text')">
					<template v-if="!preview_mode">
						<textarea v-model="scene.text.display_text" spellcheck="false" :readonly="scene.text.mode == 'json'" @click="scene.text.mode == 'json' && editInPopup('text')" />
					</template>
					<minecraft-formatting-preview v-else :text_field="scene.text" />
				</div>
				<div class="text_field_switcher" v-if="!preview_mode && selected_input == 'text'">
					<select :value="scene.text.mode" @change="scene.text.switchMode($event.target.value); $event.target.value == 'json' && editInPopup('text')">
						<option value="text">Text</option>
						<option value="translate">Translate</option>
						<option value="json">Raw JSON</option>
					</select>
				</div>
			</div>
			<div class="dialogue_buttons" v-draggable="[scene.buttons, {animation: 220, handle: '.button_handle'}]" ref="el">
				<div class="dialogue_button text_field"
					v-for="(button, i) in scene.buttons" :key="button.uuid"
					@click="clickButton(button); setSelectedInput('button'+(i+1))"
				>
					<template v-if="!preview_mode">
						<input type="text" v-model="button.text.display_text" spellcheck="false" :readonly="button.text.mode == 'json'" @click="button.text.mode == 'json' && editInPopup('button'+(i+1))" />
						<div :id="'button'+(i+1)" :class="[selected_input]"></div>
						<div class="button_edit_overlay" v-if="selected_input == 'button'+(i+1)">
							<div class="button_option_bar">
								<label>Navigation:</label>
								<select v-model="button.navigate_to">
									<option :value="''">Close</option>
									<option v-for="(goto_name, goto_uuid) in getAvailableScenes()" :key="goto_uuid" :value="goto_uuid">{{ goto_name }}</option>
								</select>
							</div>
							<div class="tool delete_button" title="Delete Button" @click="scene.removeButton(button)"><Trash :size="19" /></div>
							<div class="text_field_switcher">
								<select :value="button.text.mode" @change="button.text.switchMode($event.target.value); $event.target.value == 'json' && editInPopup('button'+(i+1))">
									<option value="text">Text</option>
									<option value="translate">Translate</option>
									<option value="json">Raw JSON</option>
								</select>
							</div>
						</div>
					</template>
					<minecraft-formatting-preview v-else :text_field="button.text" />
					<div class="button_handle"><GripVertical :site="25" /></div>
				</div>
				<div class="button_add_tool" v-if="!preview_mode && scene.buttons.length < 6" @click="scene.addButton()">
					<Plus :size="28" />
				</div>
			</div>
		</div>
		<div id="editor_bar_bottom">
			<div class="preview_mode_controls" @click="togglePreviewMode()">
				<div @click="preview_mode = true;" :class="{selected: !preview_mode}">Edit</div>
				<div @click="preview_mode = false;" :class="{selected: preview_mode}">Preview</div>
			</div>
		</div>

		<rawtext-exitor ref="editor_popup"></rawtext-exitor>
	</div>

	<div id="properties">
		<h3>Commands</h3>
		<div id="command_tab_bar">
			<div class="command_tab" @click="switchCommandTab('on_open')" :class="{open: command_tab == 'on_open'}">On Open</div>
			<div class="command_tab" @click="switchCommandTab('on_close')" :class="{open: command_tab == 'on_close'}">On Close</div>
			<div class="command_tab" @click="switchCommandTab('button1')" :class="{open: command_tab == 'button1'}" v-if="scene.buttons[0]">Button 1</div>
			<div class="command_tab" @click="switchCommandTab('button2')" :class="{open: command_tab == 'button2'}" v-if="scene.buttons[1]">Button 2</div>
			<div class="command_tab" @click="switchCommandTab('button3')" :class="{open: command_tab == 'button3'}" v-if="scene.buttons[2]">Button 3</div>
			<div class="command_tab" @click="switchCommandTab('button4')" :class="{open: command_tab == 'button4'}" v-if="scene.buttons[3]">Button 4</div>
			<div class="command_tab" @click="switchCommandTab('button5')" :class="{open: command_tab == 'button5'}" v-if="scene.buttons[4]">Button 5</div>
			<div class="command_tab" @click="switchCommandTab('button6')" :class="{open: command_tab == 'button6'}" v-if="scene.buttons[5]">Button 6</div>
		</div>
		
		<textarea
			v-model="command_value"
			placeholder="/say hello world!"
			@input="changeCommand($event)"
		/>
	</div>
</template>

<script>
import { vDraggable  } from 'vue-draggable-plus'
import { ToggleLeft, ToggleRight, User, Plus, Baseline, Globe, Braces, X, GripVertical, Trash } from 'lucide-vue-next'
import MinecraftFormattingPreview from './minecraft_formatting_preview.vue'
import RawtextExitor from './RawtextExitor.vue'
import { Scene } from './../scripts/scene'
import { lineNumbers } from '@codemirror/view'
import Codemirror from 'vue-codemirror6'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
//import {Language} from '@codemirror/language'
import {autocompletion} from "@codemirror/autocomplete"
import { reactive } from 'vue'

let editors = {};

export default {
	directives: {
		'draggable': vDraggable
	},
	components: {
		vDraggable,
		Codemirror,
		MinecraftFormattingPreview,
		RawtextExitor,
		ToggleLeft,
		ToggleRight,
		User,
		Plus,
		Baseline,
		Globe,
		Braces,
		X,
		GripVertical,
		Trash
	},
	props: {
		scene: Scene,
	},
	data() {
		return {
			oneDark,
			codemirror_extensions_command: [
				oneDark,
				autocompletion({
					override: [function(context) {
						let word = context.matchBefore(/\w*/)
						console.log(word, context)
						/*if (word.from == word.to && !context.explicit)
							return null*/
						return {
							from: word.from,
							options: [
								{label: 'test', info: 'Hey'},
								{label: 'test2', info: 'Hey'}
							]
						}
					}],

				}),
				lineNumbers()
			],
			codemirror_extensions: [oneDark, json(), lineNumbers()],
			preview_mode: true,
			selected_input: '',
			command_tab: 'on_open',
			command_value: '',
		}
	},
	emits: ['simulate_closing'],
	watch: {
		scene(scene) {
			if (this.command_tab == 'button1' && !scene.buttons[0]) this.command_tab = 'on_open';
			if (this.command_tab == 'button2' && !scene.buttons[1]) this.command_tab = 'on_open';
			if (this.command_tab == 'button3' && !scene.buttons[2]) this.command_tab = 'on_open';
			if (this.command_tab == 'button4' && !scene.buttons[3]) this.command_tab = 'on_open';
			if (this.command_tab == 'button5' && !scene.buttons[4]) this.command_tab = 'on_open';
			if (this.command_tab == 'button6' && !scene.buttons[5]) this.command_tab = 'on_open';
		}
	},
	computed: {
		buttons() {
			return reactive(this.scene.buttons)
		}
	},
	methods: {
		getAvailableScenes() {
			let scenes = {
				[this.scene.uuid]: 'Keep Open'
			};
			for (let scene of Scene.all) {
				if (scene != this.scene) {
					scenes[scene.uuid] = scene.id;
				}
			}
			return scenes;
		},
		setSelectedInput(id) {
			if (this.preview_mode) return;
			if (id.startsWith('button')) {
				this.switchCommandTab(id);
			}
			this.selected_input = id;
		},
		togglePreviewMode() {
			this.preview_mode = !this.preview_mode;
		},
		clickButton(button) {
			if (!this.preview_mode) return;
			if (button.navigate_to) {
				let scene = Scene.all.find(scene => scene.uuid == button.navigate_to);
				if (!scene) scene = Scene.all[1];
				if (scene) {
					scene.select();
				}
			} else {
				this.$emit('simulate_closing')
			}
		},
		switchCommandTab(tab) {
			this.command_tab = tab;
			switch (this.command_tab) {
				case 'on_open': this.command_value = this.scene.on_open_commands; break;
				case 'on_close': this.command_value = this.scene.on_close_commands; break;
				case 'button1': this.command_value = this.scene.buttons[0]?.commands; break;
				case 'button2': this.command_value = this.scene.buttons[1]?.commands; break;
				case 'button3': this.command_value = this.scene.buttons[2]?.commands; break;
				case 'button4': this.command_value = this.scene.buttons[3]?.commands; break;
				case 'button5': this.command_value = this.scene.buttons[4]?.commands; break;
				case 'button6': this.command_value = this.scene.buttons[5]?.commands; break;
			}
			if (!this.command_value) this.command_value = '';
		},
		editInPopup(key) {
			let text_field;
			switch (key) {
				case 'npc_name': text_field = this.scene.npc_name; break;
				case 'text': text_field = this.scene.text; break;
				case 'button1': text_field = this.scene.buttons[0].text; break;
				case 'button2': text_field = this.scene.buttons[1].text; break;
				case 'button3': text_field = this.scene.buttons[2].text; break;
				case 'button4': text_field = this.scene.buttons[3].text; break;
				case 'button5': text_field = this.scene.buttons[4].text; break;
				case 'button6': text_field = this.scene.buttons[5].text; break;
			}
			this.$refs.editor_popup.open(text_field);
		},
		changeCommand(event) {
			let value = this.command_value;
			switch (this.command_tab) {
				case 'on_open': this.scene.on_open_commands = value; break;
				case 'on_close': this.scene.on_close_commands = value; break;
				case 'button1': {let button = this.scene.buttons[0]; if (button) {button.commands = value;}} break;
				case 'button2': {let button = this.scene.buttons[1]; if (button) {button.commands = value;}} break;
				case 'button3': {let button = this.scene.buttons[2]; if (button) {button.commands = value;}} break;
				case 'button4': {let button = this.scene.buttons[3]; if (button) {button.commands = value;}} break;
				case 'button5': {let button = this.scene.buttons[4]; if (button) {button.commands = value;}} break;
				case 'button6': {let button = this.scene.buttons[5]; if (button) {button.commands = value;}} break;
			}
		},
		updateLang() {
			//console.log(this)
			//this.$forceUpdate()
		}
	}
}
</script>

<style scoped>
.button_edit_overlay {
	position: absolute;
	border: 1px solid var(--color-border);
	background-color: var(--color-background);
	color: var(--color-text);
	top: 36px;
	right: 0;
	height: 82px;
	width: 100%;
	padding: 8px;
	border-radius: 4px;
	overflow: hidden;
	z-index: 2;
}
.button_edit_overlay .text_field_switcher {
	border: none;
	background-color: transparent;
    position: relative;
    justify-content: end;
	border-radius: 4px;
    margin-bottom: 4px;
	top: -2px;
}
.delete_button {
	float: left;
	width: 34px;
	margin-top: -2px;
}
.button_option_bar {
	display: flex;
	gap: 12px;
	margin-bottom: 8px;
	align-items: center;
	white-space: nowrap;
}
.text_field_switcher {
	position: absolute;
	display: flex;
	height: 30px;
	background-color: var(--color-background);
	color: var(--color-text);
	top: -24px;
	right: 0;
	overflow: hidden;
	z-index: 2;
	font-size: 15px;
}
.text_field_switcher > svg {
	cursor: pointer;
	padding: 4px 2px;
	height: 100%;
	width: 30px;
}
.text_field_switcher > svg.selected {
	background-color: var(--color-hover);
	color: var(--color-highlight);
}
.text_field_switcher > svg:hover {
	color: var(--color-highlight);
}
.text_field {
	position: relative;
}

#scene_editor {
	position: relative;
	flex-grow: 1;
}
#editor_bar_top {
	display: flex;
	justify-content: center;
}
#editor_bar_bottom {
	display: flex;
	justify-content: center;
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
}
.preview_mode_controls {
	display: flex;
	align-items: center;
}
.preview_mode_controls > div {
	padding: 1px 6px;
	padding-top: 4px;
	cursor: pointer;
	min-width: 100px;
	text-align: center;
	font-size: 18px;
	border-top-right-radius: 4px;
	border-top-left-radius: 4px;
	background-color: var(--color-editor);
}
.preview_mode_controls > div.selected {
	background-color: var(--color-accent);
	color: black;
}

#dialogue {
	--color-mcui-bg: #c6c6c6;
	--color-mcui-highlight: #ffffff;
	--color-mcui-shadow: #555555;
	--color-mcui-content-shadow: #3c3c3c;
	--color-mcui-text: #000;
	--color-mcui-text-button: #4c4c4c;
	--mcui-text-size: 20px;

	max-width: 800px;
	min-height: 350px;
	color: var(--color-mcui-text);
	background-color: var(--color-mcui-bg);
	border: 6px solid var(--color-mcui-highlight);
	outline: 3px solid black;
	border-radius: 9px;
	border-bottom-color: var(--color-mcui-shadow);
	border-right-color: var(--color-mcui-shadow);
	padding: 15px;
	margin: auto;
	margin-top: 50px;
	display: flex;
	flex-direction: column;
}
#dialogue input {
	color: var(--color-mcui-text);
}

.dialogue_title {
	height: 44px;
	color: var(--color-mcui-text-button);
	font-family: minecraft8;
	font-size: var(--mcui-text-size);
	font-weight: 400;
	text-indent: 0.3px;
	user-select: text;
	text-align: center;
	flex-shrink: 0;
}
.dialogue_title > input {
	text-align: center;
}
.dialogue_main_row {
	display: flex;
	flex-grow: 1;
	gap: 9px;
	position: relative;
	min-height: 0;
	max-height: 275px;
}
.portrait_dummy {
	width: 150px;
	flex-shrink: 0;
	background: #494949;
	border: 3px solid black;
	position: relative;
}
@media only screen and (max-width: 800px) {
	.portrait_dummy {
		display: none;
	}
}
.portrait_dummy > svg {
	position: absolute;
	bottom: 0;
	width: 100%;
	height: 124px;
	margin-bottom: -6px;
	opacity: 0.2;
}
.dialogue_content {
	background-color: #eee9e4;
	border: 3px solid #b3b3b3;
	box-shadow: 6px 6px 0 var(--color-mcui-content-shadow);
	border-radius: 9px;
	flex-grow: 1;
	margin-bottom: 4px;
	padding: 4px;
	overflow-y: auto;
}
.dialogue_buttons {
	display: flex;
	gap: 15px;
	padding: 15px 2px;
	padding-bottom: 8px;
	min-height: 63px;
	flex-wrap: wrap;
	flex-shrink: 0;
	gap: 15px;
}
.dialogue_buttons > ul {
}

.dialogue_button {
	background-color: var(--color-mcui-bg);
	box-shadow: 0 0 0 2px #000;
	border: 3px solid var(--color-mcui-highlight);
	border-bottom-color: var(--color-mcui-shadow);
	border-right-color: var(--color-mcui-shadow);
	outline: 2px solid black;
	color: var(--color-mcui-text-button);
	height: 40px;
	width: 226px;
	min-width: 226px;
	padding: 2px;
	text-align: center;
	cursor: pointer;
}
#dialogue.preview_mode .dialogue_button:hover {
	background-color: #218306;
	color: #ffffff;
	border-color: #17cd07;
	border-bottom-color: #004e00;
	border-right-color: #004e00;
	outline: 2px solid white;
}
#dialogue.preview_mode .dialogue_button:active {
	background-color: #218306;
	color: #ffffff;
	border-color: #004e00;
	border-bottom-color: #17cd07;
	border-right-color: #17cd07;
	outline: 2px solid white;
}
.button_add_tool {
	padding-top: 4px;
	cursor: pointer;
}
.button_handle {
	position: absolute;
	right: 4px;
	top: 5px;
	width: 26px;
	height: 38px;
	display: none;
	text-align: center;
	cursor: grab;
}
#dialogue:not(.preview_mode) .dialogue_button:hover .button_handle {
	display: block;
}
textarea,
input[type=text] {
	font-family: monospace, consolas;
	font-size: 18px;
	border: none;
	background: no-repeat;
	width: 100%;
	height: 100%;
	resize: none;
}

#properties {
	min-height: 210px;
	border-top: 1px solid var(--color-border);
	display: flex;
    flex-direction: column;
}
#properties h3 {
    padding: 2px 12px;
}
#properties .ͼ1 {
	border: 1px solid red;
}

#command_tab_bar {
	display: flex;
	height: 32px;
}
.command_tab {
	padding: 4px 12px;
	cursor: pointer;
}
.command_tab:hover {
	color: var(--color-highlight);
}
.command_tab.open {
	background-color: var(--color-editor);
	color: var(--color-subtle);
}

textarea {
	font-family: Consolas, monospace;
	padding: 4px 8px;
	font-size: 17px;
	color: inherit;
}
#properties textarea {
	background-color: var(--color-editor);
}
#properties .ͼ1 {
	flex-grow: 1;
}

</style>

<style>
#properties .ͼ1 {
	flex-grow: 1;
}
</style>