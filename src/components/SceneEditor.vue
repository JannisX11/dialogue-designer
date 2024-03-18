<template>
	<div id="scene_editor" @click.stop="setSelectedInput('')">
		<div id="editor_bar_top">

		</div>
		<div id="dialogue" :class="{preview_mode: preview_mode}" @dblclick="preview_mode && togglePreviewMode()">
			<div class="dialogue_title text_field" @click="setSelectedInput('npc_name')">
				<template v-if="!preview_mode">
					<input type="text" v-model="scene.npc_name.text" spellcheck="false" :readonly="scene.npc_name.mode == 'json'" @click="scene.npc_name.mode == 'json' && editInPopup('npc_name')" />
					<div class="text_field_switcher" v-if="selected_input == 'npc_name'">
						<Baseline :size="19" title="Type: Plain Text" @click="scene.npc_name.switchMode('text')" :class="{selected: scene.npc_name.mode == 'text'}" />
						<Globe :size="19" title="Type: Translated" @click="scene.npc_name.switchMode('translate')" :class="{selected: scene.npc_name.mode == 'translate'}" />
						<Braces :size="19" title="Type: JSON Rawtext" @click="scene.npc_name.switchMode('json'); editInPopup('npc_name')" :class="{selected: scene.npc_name.mode == 'json'}" />
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
						<textarea v-model="scene.text.text" spellcheck="false" :readonly="scene.text.mode == 'json'" @click="scene.text.mode == 'json' && editInPopup('text')" />
						<div class="text_field_switcher" v-if="selected_input == 'text'">
							<Baseline :size="19" title="Type: Plain Text" @click="scene.text.switchMode('text')" :class="{selected: scene.text.mode == 'text'}" />
							<Globe :size="19" title="Type: Translated" @click="scene.text.switchMode('translate')" :class="{selected: scene.text.mode == 'translate'}" />
							<Braces :size="19" title="Type: JSON Rawtext" @click="scene.text.switchMode('json'); editInPopup('text')" :class="{selected: scene.text.mode == 'json'}" />
						</div>
					</template>
					<minecraft-formatting-preview v-else :text_field="scene.text" />
				</div>
			</div>
			<div class="dialogue_buttons">
				<div class="dialogue_button text_field"
					v-for="(button, i) in scene.buttons" :key="button.uuid"
					@click="clickButton(button); setSelectedInput('button'+(i+1))"
				>
					<template v-if="!preview_mode">
						<input type="text" v-model="button.text.text" spellcheck="false" :readonly="button.text.mode == 'json'" @click="button.text.mode == 'json' && editInPopup('button'+(i+1))" />
						<div class="button_edit_overlay" v-if="selected_input == 'button'+(i+1)">

							<div class="text_field_switcher">
								<Baseline :size="19" title="Type: Plain Text" @click="button.text.switchMode('text')" :class="{selected: button.text.mode == 'text'}" />
								<Globe :size="19" title="Type: Translated" @click="button.text.switchMode('translate')" :class="{selected: button.text.mode == 'translate'}" />
								<Braces :size="19" title="Type: JSON Rawtext" @click="button.text.switchMode('json'); editInPopup('button'+(i+1))" :class="{selected: button.text.mode == 'json'}" />
							</div>
							<div class="button_option_bar">
								<label>Navigate To:</label>
								<select v-model="button.navigate_to">
									<option :value="''">-</option>
									<option v-for="(goto_name, goto_uuid) in getAvailableScenes()" :key="goto_uuid" :value="goto_uuid">{{ goto_name }}</option>
								</select>
							</div>
						</div>
					</template>
					<minecraft-formatting-preview v-else :text_field="button.text" />

				</div>
				<div class="button_add_tool" v-if="scene.buttons.length < 3" @click="scene.addButton()">
					<Plus :size="28" />
				</div>
			</div>
		</div>
		<div id="editor_bar_bottom">
			<div class="preview_mode_controls" @click="togglePreviewMode()">
				Preview
				<ToggleLeft :size="30" v-if="preview_mode" />
				<ToggleRight :size="30" v-else />
				Edit
			</div>
		</div>

		<dialog id="editor_popup" ref="editor_popup">
			<div class="editor_popup_bar">
				<X :size="20" @click="closePopup()" />
			</div>
			<textarea
				v-model="popup_value"
				@input="changePopupValue($event)"
			/>
			<p v-if="popup_error">{{ popup_error }}</p>
		</dialog>
	</div>

	<div id="properties">
		<h3>Commands</h3>
		<div id="command_tab_bar">
			<div class="command_tab" @click="switchCommandTab('on_open')" :class="{open: command_tab == 'on_open'}">On Open</div>
			<div class="command_tab" @click="switchCommandTab('on_close')" :class="{open: command_tab == 'on_close'}">On Close</div>
			<div class="command_tab" @click="switchCommandTab('button1')" :class="{open: command_tab == 'button1'}" v-if="scene.buttons[0]">Button 1</div>
			<div class="command_tab" @click="switchCommandTab('button2')" :class="{open: command_tab == 'button2'}" v-if="scene.buttons[1]">Button 2</div>
			<div class="command_tab" @click="switchCommandTab('button3')" :class="{open: command_tab == 'button3'}" v-if="scene.buttons[2]">Button 3</div>
		</div>
		
		<textarea
			v-model="command_value"
			placeholder="/say hello world!"
			@input="changeCommand($event)"
		/>
	</div>
</template>

<script>
import { ToggleLeft, ToggleRight, User, Plus, Baseline, Globe, Braces, X } from 'lucide-vue-next'
import MinecraftFormattingPreview from './minecraft_formatting_preview.vue'
import { Scene } from './../scripts/scene'
import { lineNumbers } from '@codemirror/view'
import Codemirror from 'vue-codemirror6'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
//import {Language} from '@codemirror/language'
import {autocompletion} from "@codemirror/autocomplete"

let editors = {};

export default {
	components: {
		Codemirror,
		MinecraftFormattingPreview,
		ToggleLeft,
		ToggleRight,
		User,
		Plus,
		Baseline,
		Globe,
		Braces,
		X
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
			popup_edit_key: '',
			popup_error: '',
			popup_value: '',
			command_value: '',
		}
	},
	watch: {
		scene(scene) {
			if (this.command_tab == 'button1' && !scene.buttons[0]) this.command_tab = 'on_open';
			if (this.command_tab == 'button2' && !scene.buttons[1]) this.command_tab = 'on_open';
			if (this.command_tab == 'button3' && !scene.buttons[2]) this.command_tab = 'on_open';
		}
	},
	computed: {
	},
	methods: {
		getAvailableScenes() {
			let scenes = {};
			for (let scene of Scene.all) {
				if (scene == this.scene) continue;
				scenes[scene.uuid] = scene.id;
			}
			return scenes;
		},
		setSelectedInput(id) {
			if (this.preview_mode) return;
			this.selected_input = id;
		},
		togglePreviewMode() {
			this.preview_mode = !this.preview_mode;
		},
		clickButton(button) {
			console.log(this.preview_mode)
			if (!this.preview_mode) return;
			if (button.navigate_to) {
				let scene = Scene.all.find(scene => scene.uuid == button.navigate_to);
				if (!scene) scene = Scene.all[1];
				if (scene) {
					scene.select();
				}
			}
		},
		switchCommandTab(tab) {
			this.command_tab = tab;
			//editors.commands.state.selection.mainIndex = 0;
			//editors.commands.state.selection.ranges[0].from = 0;
			//editors.commands.state.selection.ranges[0].to = 0;
			switch (this.command_tab) {
				case 'on_open': this.command_value = this.scene.on_open_commands; break;
				case 'on_close': this.command_value = this.scene.on_close_commands; break;
				case 'button1': this.command_value = this.scene.buttons[0]?.commands; break;
				case 'button2': this.command_value = this.scene.buttons[1]?.commands; break;
				case 'button3': this.command_value = this.scene.buttons[2]?.commands; break;
			}
			if (!this.command_value) this.command_value = '';
		},
		editInPopup(key) {
			this.popup_edit_key = key;
			this.popup_value = this.getPopupEditorValue();
			this.$refs.editor_popup.showModal();
		},
		closePopup() {
			this.popup_error = '';
			try {
				JSON.parse(this.getPopupEditorValue());
			} catch (err) {
				this.popup_error = err.toString();
			}
			if (!this.popup_error) {
				this.$refs.editor_popup.close();
			}
		},
		getPopupEditorValue() {
			switch (this.popup_edit_key) {
				case 'npc_name': return this.scene.npc_name.json;
				case 'text': return this.scene.text.json;
				case 'button1': return this.scene.buttons[0].text.json;
				case 'button2': return this.scene.buttons[1].text.json;
				case 'button3': return this.scene.buttons[2].text.json;
			}
		},
		changeCommand(event) {
			let value = this.command_value;
			switch (this.command_tab) {
				case 'on_open': this.scene.on_open_commands = value; break;
				case 'on_close': this.scene.on_close_commands = value; break;
				case 'button1': {let button = this.scene.buttons[0]; if (button) {button.commands = value;}} break;
				case 'button2': {let button = this.scene.buttons[1]; if (button) {button.commands = value;}} break;
				case 'button3': {let button = this.scene.buttons[2]; if (button) {button.commands = value;}} break;
			}
		},
		changePopupValue(event) {
			let value = this.popup_value;
			switch (this.popup_edit_key) {
				case 'npc_name': this.scene.npc_name.json = value; break;
				case 'text': this.scene.text.json = value; break;
				case 'button1': this.scene.text.json = value; break;
				case 'button2': this.scene.text.json = value; break;
				case 'button3': this.scene.text.json = value; break;
			}
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
}
.button_option_bar {
	display: flex;
	gap: 12px;
	align-items: center;
}
.text_field_switcher {
	position: absolute;
	display: flex;
	height: 30px;
	border: 1px solid var(--color-border);
	background-color: var(--color-background);
	color: var(--color-text);
	top: 0;
	right: 0;
	border-radius: 15px;
	overflow: hidden;
	z-index: 2;
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
	padding: 6px;
	gap: 5px;
	cursor: pointer;
	width: fit-content;
	align-items: center;
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
	height: 350px;
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
}
.dialogue_title > input {
	text-align: center;
}
.dialogue_main_row {
	display: flex;
	flex-grow: 1;
	gap: 9px;
}
.portrait_dummy {
	width: 150px;
	background: #494949;
	border: 3px solid black;
	position: relative;
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
}
.dialogue_buttons {
	display: flex;
	gap: 15px;
	padding: 15px 2px;
	padding-bottom: 8px;
	min-height: 63px;
	flex-wrap: wrap;
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
	min-width: 240px;
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

#editor_popup {
	width: 680px;
	height: 500px;
}

textarea {
	font-family: Consolas, monospace;
	padding: 4px 8px;
	font-size: 17px;
	color: inherit;
}
#properties textarea, #editor_popup textarea {
	background-color: var(--color-editor);
}
#editor_popup > textarea {
	height: calc(100% - 50px);
}

</style>

<style>
#properties .ͼ1 {
	flex-grow: 1;
}
#editor_popup .vue-codemirror {
	height: calc(100% - 58px);
	border: 1px solid var(--color-border);
}
#editor_popup .ͼ1 {
	height: 100%;
}
</style>