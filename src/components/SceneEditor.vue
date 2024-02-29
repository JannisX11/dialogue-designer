<template>
	<div id="scene_editor">
		<div id="editor_bar_top">

		</div>
		<div id="dialogue">
			<div class="dialogue_title">
				<input type="text" v-if="!preview_mode" v-model="scene.npc_name" spellcheck="false" />
				<minecraft-formatting-preview v-else :text="scene.npc_name" />
			</div>
			<div class="dialogue_main_row">
				<div class="portrait_dummy">
					<User />
				</div>
				<div class="dialogue_content">
					<textarea v-if="!preview_mode" v-model="scene.text" spellcheck="false" />
					<minecraft-formatting-preview v-else :text="scene.text" />
				</div>
			</div>
			<div class="dialogue_buttons">
				<div class="dialogue_button"
					v-for="button in scene.buttons" :key="button.uuid"
				>
					<textarea v-if="!preview_mode" v-model="button.text" spellcheck="false" />
					<minecraft-formatting-preview v-else :text="button.text" />
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
	</div>

	<div id="properties">
		<h3>Dialogue</h3>
		<h3>Commands</h3>
		
		<li class="command_bar" v-for="command in scene.on_open_commands" :key="command">
			
		</li>
	</div>
</template>

<script>
import { ToggleLeft, ToggleRight, User, Plus } from 'lucide-vue-next'
import { Scene } from './../scripts/scene'

import MinecraftFormattingPreview from './minecraft_formatting_preview.vue'

export default {
	components: {
		MinecraftFormattingPreview,
		ToggleLeft,
		ToggleRight,
		User,
		Plus
	},
	props: {
		scene: Scene,
	},
	data() {
		return {
			preview_mode: true,
		}
	},
	methods: {
		togglePreviewMode() {
			this.preview_mode = !this.preview_mode;
		}
	}
}
</script>

<style scoped>

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
	overflow: auto;
	padding: 15px;
	margin: auto;
	margin-top: 50px;
	display: flex;
	flex-direction: column;
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
	min-height: 120px;
	border-top: 1px solid var(--color-border);
}

</style>