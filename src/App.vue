<script setup>
import SceneEditor from './components/SceneEditor.vue'
import LocalizationEditor from './components/LocalizationEditor.vue'
</script>

<template>
	<div id="start_page" v-if="page == 'start'">
		<img src="./assets/dialogue_designer_splash.png" height="500">
		<div>
			<h1>DialogueDesigner</h1>
			<p>Create interactive NPC dialogues for Minecraft: Bedrock Edition!</p>
			<button @click="newFile()">New Dialogue</button>
			<button @click="importFile()">Open File</button>
		</div>
	</div>
	<div id="wrapper" v-else-if="page == 'editor'" :mobile_page="mobile_page">
		<header>
			<h1>DialogueDesigner</h1>
			<div class="tool" @click="importFile()">
				<FolderOpen :size="22" />
				Import
			</div>
			<div class="tool" @click="saveFile()">
				<Save :size="22" />
				Save
			</div>
		</header>
		<div id="sidebar">
			<h3>Project</h3>
			<div class="form_grid">
				<label>File Name</label>
				<input type="text" v-model="Project.name">
				<label>Prefix</label>
				<input type="text" v-model="Project.namespace">
			</div>

			<h3>Scenes</h3>
			<ul>
				<div class="tool" @click="addScene()">
					<Plus :size="22" />
					Add Scene
				</div>
			</ul>
			<ul style="flex-grow: 1;">
				<li v-for="scene in scenes" :key="scene.uuid"
					class="scene"
					:class="{selected: scene == selected_scene, a: true}" 
					@click="selectScene(scene)"
					@dblclick="renameScene(scene)"
				>
					<MessageSquare :size="22" />
					<input type="text" v-model="scene.id" :readonly="scene == selected_scene && renaming_scene ? false : true" spellcheck="false" @blur="renaming_scene = false">
				</li>
			</ul>

			<h3>Languages</h3>
			<ul id="lang_file_list">
				<li class="lang_file" v-for="language in lang_files" :key="language.uuid" @click="selectLangFile(language)" :class="{selected: language == selected_lang_file}">
					{{ language.id }}
				</li>
				<Plus :size="22" @click="addLangFile()" />
			</ul>
		</div>
		<main>
			<LocalizationEditor v-if="selected_lang_file" :language="selected_lang_file"></LocalizationEditor>
			<SceneEditor v-else-if="selected_scene" :scene="selected_scene"></SceneEditor>
		</main>
		<nav id="mobile_nav">
			<div @click="mobile_page = 'sidebar'">
				<List />
			</div>
			<div @click="mobile_page = 'editor'">
				<MessageSquareCode />
			</div>
		</nav>
	</div>
</template>


<script>

import { Scene } from './scripts/scene';
import { Project } from './scripts/project'
import { Plus, MessageSquare, Save, FolderOpen, List, MessageSquareCode } from 'lucide-vue-next'
import {reactive} from 'vue'
import { selectFileToImport, resetProject } from './scripts/import'
import { exportDialogueFile } from './scripts/export'
import { LangFile } from './scripts/lang_file';

Scene.all = reactive(Scene.all);
LangFile.all = reactive(LangFile.all);

export default {
	components: {
		SceneEditor,
		LocalizationEditor
	},
	data() {
		return {
			scenes: Scene.all,
			lang_files: LangFile.all,
			project: Project,
			selected_scene: null,
			renaming_scene: false,
			page: 'start',
			main_tab: 'scene',
			languages: Project.languages,
			selected_lang_file: null,
			mobile_page: 'sidebar'
		}
	},
	methods: {
		newFile() {
			resetProject();
			this.page = 'editor';
		},
		importFile() {
			selectFileToImport().then(() => {
				this.page = 'editor';
			})
		},
		saveFile() {
			exportDialogueFile();
		},
		addScene() {
			let scene = new Scene();
			this.selectScene(scene);
		},
		selectScene(scene) {
			this.selected_lang_file = null;
			this.selected_scene = scene;
			Scene.selected = scene;
		},
		renameScene(scene) {
			this.renaming_scene = true;
		},
		addLangFile() {
			let lf = new LangFile('en-US').setUniqueID();
			this.selectLangFile(lf);
		},
		selectLangFile(lf) {
			this.selected_scene = null;
			this.selected_lang_file = lf;
			console.log(this.selected_lang_file);
		}
	},
	mounted() {
		let vue_scope = this;
		Scene.prototype.select = function() {
			console.log(this)
			vue_scope.selectScene(this);
		}
	}
}
</script>

<style scoped>

#start_page {
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 40px;
}
#start_page > * {
	flex: 0 1 300px;
}
#start_page h1 {
	padding-left: 0;
	font-size: 32px;
}
#start_page p {
	margin: 16px 0;
}
#start_page button {
	display: inline-block;
	margin-right: 8px;
}

#wrapper {
	height: 100%;
	display: grid;
	grid-template-rows: 40px auto;
	grid-template-columns: 300px auto;
	grid-template-areas: 
		"header header"
		"sidebar editor";
}
header {
	grid-area: header;
	border-bottom: 1px solid var(--color-border);
	display: flex;
	align-items: center;
}
h1 {
	font-size: 22px;
	padding: 0 22px;
	color: var(--color-subtle);
}
#sidebar {
	grid-area: sidebar;
	border-right: 1px solid var(--color-border);
	display: flex;
	flex-direction: column;
}
main {
	grid-area: editor;
	display: flex;
	flex-direction: column;
}
nav#mobile_nav {
	grid-area: mobile_nav;
	display: none;
}
@media only screen and (max-width: 800px) {
	#start_page {
		flex-direction: column;
	}
	#wrapper {
		height: 100%;
		display: grid;
		grid-template-rows: 40px auto 44px;
		grid-template-columns: auto;
	}
	#wrapper[mobile_page="sidebar"] {
		grid-template-areas: 
			"header"
			"sidebar"
			"mobile_nav";
	}
	#wrapper:not([mobile_page="sidebar"]) #sidebar {
		display: none;
	}
	#wrapper[mobile_page="editor"] {
		grid-template-areas: 
			"header"
			"editor"
			"mobile_nav";
	}
	#wrapper:not([mobile_page="editor"]) #main {
		display: none;
	}
	nav#mobile_nav {
		display: flex;
	}
}


.form_bar {
	padding: 2px 8px;
	display: flex;
	gap: 6px;
	align-items: center;
}
.form_grid {
	padding: 2px 8px;
	display: grid;
	grid-template-columns: auto auto;
	gap: 6px;
}
.form_grid label {
	padding: 3px 0;
}
.tool {
	display: flex;
	cursor: pointer;
	height: 30px;
	align-items: center;
	padding: 2px;
	gap: 5px;
}
.tool:hover {
	color: var(--color-highlight);
}
h3 {
	color: var(--color-subtle);
	margin-top: 20px;
	padding: 5px;
	user-select: none;
}
.scene {
	height: 36px;
	display: flex;
	padding: 4px;
}
.scene:hover {
	color: var(--color-highlight);
}
.scene.selected {
	background-color: var(--color-hover);
}
.scene > svg {
	width: 36px;
	margin-top: 2px;
}
.scene > input[type=text] {
	background: none;
	border: none;
	font-size: inherit;
	color: inherit;
}
.scene > input[type=text]:read-only {
	outline: none;
	cursor: inherit;
}
#lang_file_list {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-block: 16px;
	padding: 2px 6px;
	align-items: center;
}
#lang_file_list > svg {
	cursor: pointer;
}
#lang_file_list > svg:hover {
	color: var(--color-highlight);
}
.lang_file {
	padding: 2px 8px;
	border: 1px solid var(--color-border);
	border-radius: 4px;
	cursor: pointer;
}
.lang_file:hover {
	background-color: var(--color-hover);
	color: var(--color-highlight);
}
.lang_file.selected {
	background-color: var(--color-selected);
	color: var(--color-highlight);
}

</style>
