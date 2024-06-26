<script setup>
import SceneEditor from './components/SceneEditor.vue'
import LocalizationEditor from './components/LocalizationEditor.vue'
import ExportDialog from './components/ExportDialog.vue'
</script>

<template>
	<div id="start_page" v-if="page == 'start'">
		<img src="./assets/dialogue_designer_splash.png" height="500">
		<div>
			<h1>DialogueDesigner</h1>
			<p>Create interactive NPC dialogues for Minecraft: Bedrock Edition!</p>
			<button @click="newFile()">New Dialogue</button>
			<button @click="importFile()">Open File</button>
			<p>Documentation: <a href="https://learn.microsoft.com/en-us/minecraft/creator/documents/npcdialoguedesigner" target="_blank" rel="noopener">Learning Portal</a></p>
		</div>
		<p class="credit_info">
			Created by <a href="https://github.com/JannisX11" target="_blank" rel="noopener">JannisX11</a> in collaboration with <a href="https://mojang.com" target="_blank" rel="noopener">Mojang Studios</a> -
			<a href="https://github.com/JannisX11/dialogue-designer/" target="_blank" rel="noopener">Open Source under GPL-3.0</a>
		</p>
	</div>
	<div id="wrapper" v-else-if="page == 'editor'" :mobile_page="mobile_page">
		<header>
			<h1>DialogueDesigner</h1>
			<div class="tool" @click="importFile()">
				<FolderOpen :size="22" />
				Import
			</div>
			<div class="tool" @click="newFile()">
				<FilePlus :size="22" />
				New File
			</div>
			<div class="tool export_button" @click="openExportDialog()">
				<Save :size="22" />
				Export
			</div>
		</header>
		<div id="sidebar">
			<h3>Project</h3>
			<div class="form_grid">
				<label>File Name</label>
				<input type="text" v-model="project.name" @input="updateProjectName()">
				<label>Prefix</label>
				<input type="text" v-model="project.prefix" @input="updateProjectPrefix()">
			</div>

			<h3>Scenes</h3>
			<ul>
				<div class="tool" @click="addScene()" title="Add Scene">
					<Plus :size="22" />
				</div>
				<div class="tool" v-if="selected_scene" @click="duplicateScene()" title="Duplicate Scene">
					<Copy :size="22" />
				</div>
				<div class="tool" v-if="selected_scene" @click="deleteScene()" title="Delete Scene">
					<Trash :size="22" />
				</div>
			</ul>
			<ul v-draggable="[scenes, {animation: 80, handle: '.scene_handle'}]" id="scene_list" ref="scene_list">
				<li v-for="scene in scenes" :key="scene.uuid"
					class="scene"
					:class="{selected: scene == selected_scene, a: true}" 
					@click="selectScene(scene)"
					@dblclick="renameScene(scene)"
				>
					<MessageSquare class="scene_handle" :size="22" />
					<input type="text" v-model="scene.id" :readonly="scene == selected_scene && renaming_scene ? false : true" spellcheck="false" @blur="renaming_scene = false">
				</li>
			</ul>

			<h3>Languages</h3>
			<ul>
				<div class="tool" @click="addLanguage()" title="Create Language File">
					<Plus :size="22" />
				</div>
				<div class="tool" @click="importLanguage()" title="Import Language File">
					<FolderOpen :size="22" />
				</div>
				<div class="tool" v-if="selected_lang_file" @click="duplicateLanguage()" title="Duplicate Language File">
					<Copy :size="22" />
				</div>
				<div class="tool" v-if="selected_lang_file" @click="deleteLanguage()" title="Delete Language File">
					<Trash :size="22" />
				</div>
				<div class="tool" v-if="selected_lang_file" @click="openLangFile(selected_lang_file)" title="Edit Language File">
					<FilePenLine :size="22" />
				</div>
			</ul>
			<ul id="lang_file_list">
				<li class="lang_file" v-for="language in lang_files" :key="language.uuid" @click="selectLangFile(language)" @dblclick="openLangFile(language)" @contextmenu="openLangFile(language)" :class="{selected: language == selected_lang_file}">
					{{ language.id }}
				</li>
			</ul>
		</div>
		<main>
			<div v-if="simulate_closing" id="closed_dialogue_screen">
				<span>The dialogue has been closed</span>
				<button @click="reopenLastScene()">Reopen</button>
			</div>
			<SceneEditor v-else-if="selected_scene" ref="scene_editor" :scene="selected_scene" @simulate_closing="simulateClosing()"></SceneEditor>
			<LocalizationEditor v-else-if="selected_lang_file" :language="selected_lang_file"></LocalizationEditor>
			<div v-else id="closed_dialogue_screen">
				<span>Create or select a scene from the sidebar</span>
			</div>
		</main>
		<nav id="mobile_nav">
			<div @click="mobile_page = 'sidebar'" :class="{selected: mobile_page == 'sidebar'}">
				<List />
			</div>
			<div @click="mobile_page = 'editor'" :class="{selected: mobile_page == 'editor'}">
				<MessageSquareCode />
			</div>
		</nav>

		<export-dialog ref="export_dialog" @save="saved = true"></export-dialog>
	</div>
	<dialog id="autoload_lang_dialog" ref="autoload_lang_dialog">

		<h2 style="margin-bottom: 10px;">Translation Data</h2>

		<p>The imported dialogue contains translated texts. Do you want to load the corresponding language (.lang) files?</p>

		<div class="button_bar">
			<button @click="$refs.autoload_lang_dialog.close(); importLanguage()">Load</button>
			<button @click="$refs.autoload_lang_dialog.close()">Ignore</button>
		</div>
	</dialog>
</template>


<script>

import './scripts/keybindings'
import { vDraggable  } from 'vue-draggable-plus'
import { Scene } from './scripts/scene';
import { Project } from './scripts/project'
import { Plus, Copy, Trash, MessageSquare, Save, FolderOpen, FilePenLine, FilePlus, List, MessageSquareCode } from 'lucide-vue-next'
import {nextTick, reactive} from 'vue'
import { selectFileToImport, resetProject, OnImport } from './scripts/import'
import { exportDialogueFile } from './scripts/export'
import { importLangFile, LangFile } from './scripts/lang_file';
import { addKeybinding } from './scripts/keybindings'

let reactive_project = reactive(Project);
Scene.all = reactive(Scene.all);
LangFile.all = reactive(LangFile.all);

let simulate_close_timeout;

export default {
	components: {
		SceneEditor,
		LocalizationEditor,
		ExportDialog,
		Plus, Copy, Trash, MessageSquare, Save, FolderOpen, FilePenLine, FilePlus, List, MessageSquareCode
	},
	data() {
		return {
			scenes: Scene.all,
			lang_files: LangFile.all,
			project: reactive_project,
			saved: false,
			selected_scene: null,
			last_scene: null,
			renaming_scene: false,
			simulate_closing: false,
			page: 'start',
			main_tab: 'scene',
			languages: Project.languages,
			selected_lang_file: null,
			mobile_page: 'sidebar'
		}
	},
	methods: {
		newFile() {
			if (this.saved == false && this.scenes.length && !window.confirm('Are you sure you want to create a new file? You will lose all unsaved changes.')) return;
			this.resetProject();
		},
		importFile() {
			if (this.saved == false && this.scenes.length && !window.confirm('Are you sure you want to load another file? You will lose all unsaved changes.')) return;
			this.resetProject();
			selectFileToImport().then(() => {
				this.afterFileImported();
			})
		},
		afterFileImported() {
			this.page = 'editor';
			if (Scene.all.find(scene => scene.hasTranslations())) {
				this.$refs.autoload_lang_dialog.showModal();
			}
		},
		resetProject() {
			resetProject();
			this.selected_scene = null;
			this.last_scene = null;
			this.renaming_scene = false;
			this.selected_lang_file = null;
			this.page = 'editor';
		},
		saveFile() {
			exportDialogueFile();
		},
		updateProjectName() {
			this.project.name = this.project.name.toLowerCase();
			if (!this.project.customized_prefix) {
				this.project.prefix = this.project.name + '_';
			}
		},
		updateProjectPrefix() {
			this.project.prefix = this.project.prefix.toLowerCase();
			this.project.customized_prefix = true;
		},
		openExportDialog() {
			this.$refs.export_dialog.open();
		},
		addScene() {
			let scene = new Scene();
			this.selectScene(scene);
			nextTick(() => {
				if (this.$refs.scene_editor) {
					this.$refs.scene_editor.preview_mode = false;
				}
			})
		},
		duplicateScene() {
			let scene = new Scene().copy(this.selected_scene);
			this.selectScene(scene);
		},
		deleteScene() {
			let index = Scene.all.indexOf(this.selected_scene);
			Scene.all.splice(index, 1);
			this.selectScene(Scene.all[Math.min(index, Scene.all.length-1)]);
		},
		selectScene(scene) {
			this.last_scene = this.selected_scene;
			this.selected_scene = scene;
			Scene.selected = scene;
			this.simulate_closing = false;
			this.mobile_page = 'editor';
		},
		reopenLastScene() {
			if (this.last_scene && Scene.all.includes(this.last_scene)) {
				this.selectScene(this.last_scene);
			}
		},
		renameScene(scene) {
			this.renaming_scene = true;
		},
		simulateClosing() {
			this.simulate_closing = true;
			simulate_close_timeout = setTimeout(() => {
				this.simulate_closing = false;
			}, 460);
		},
		addLanguage() {
			let lf = new LangFile('en_US').setUniqueID();
			this.openLangFile(lf);
		},
		importLanguage() {
			importLangFile().then(lang_file => {
				if (lang_file) this.openLangFile(lang_file);
			})
		},
		duplicateLanguage() {
			let source = this.selected_lang_file;
			let lf = new LangFile(source.id, source.content).copy(source);
			this.openLangFile(lf);
		},
		deleteLanguage() {
			let selected = this.selected_lang_file;
			if (selected.content.length < 5 || confirm('Do you really want to delete this lang file')) {
				LangFile.all.splice(LangFile.indexOf(selected), 1);
			}
		},
		selectLangFile(lf) {
			this.selected_lang_file = lf;
			LangFile.selected = lf;
			let old_scene = this.selected_scene;
			this.selected_scene = null;
			nextTick(() => {
				this.selected_scene = old_scene;
				if (this.selected_scene && this.$refs.scene_editor) {
					//this.$refs.scene_editor.updateLang();
				}
			})
		},
		openLangFile(lf) {
			this.selected_scene = null;
			this.selected_lang_file = lf;
			LangFile.selected = lf;
			this.mobile_page = 'editor';
		}
	},
	mounted() {
		let vue_scope = this;
		Scene.prototype.select = function() {
			vue_scope.selectScene(this);
		}
		addKeybinding('s', {ctrl: true}, () => {
			this.openExportDialog();
		})

		OnImport.dialogue = () => {
			this.afterFileImported();
		}

		window.onbeforeunload = (e) => {
			if (this.scenes.length && !this.saved) {
				return 'You have unsaved changes!'
			}
		}
	}
}
</script>

<style scoped>

#closed_dialogue_screen {
	text-align: center;
	margin-top: calc(40vh - 50px);
	color: var(--color-subtle);
}
#closed_dialogue_screen button {
	display: block;
	margin: auto;
	margin-top: 12px;
}
.tool.export_button {
	background-color: var(--color-accent);
	color: black;
	margin-left: auto;
	padding: 0 16px;
	height: 100%;
}
.tool.export_button:hover {
	background-color: var(--color-accent-hover);
}

#autoload_lang_dialog {
	width: 420px;
	height: max-content;
}
#start_page {
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 40px;
	overflow: hidden;
}
#start_page > * {
	flex: 0 1 300px;
	padding: 10px;
}
#start_page > img {
	max-width: 100%;
}
#start_page > div {
	margin-bottom: 63px;
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
.credit_info {
	color: var(--color-subtle);
	opacity: 0.65;
	position: fixed;
	bottom: -6px;
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
	gap: 12px;
}
h1 {
	font-size: 22px;
	padding: 0 18px;
	color: var(--color-subtle);
	overflow: hidden;
	flex-shrink: 1;
}
header .tool {
	min-width: 90px;
}
#sidebar {
	grid-area: sidebar;
	border-right: 1px solid var(--color-border);
	display: flex;
	flex-direction: column;
	max-height: calc(100vh - 40px);
}
main {
	grid-area: editor;
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	overflow: hidden;
}
nav#mobile_nav {
	grid-area: mobile_nav;
	display: none;
}
@media only screen and (max-width: 800px) {
	#start_page {
		flex-direction: column;
		text-align: center;
		gap: 5px;
		padding-bottom: 100px;
	}
	header {
		gap: 4px;;
		max-width: 100vw;
	}
	#wrapper {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	#sidebar {
		flex-grow: 1;
	}
	#wrapper:not([mobile_page="sidebar"]) #sidebar {
		display: none;
	}
	#wrapper:not([mobile_page="editor"]) main {
		display: none;
	}
	nav#mobile_nav {
		display: flex;
	}
	nav#mobile_nav > div {
		flex-grow: 1;
		text-align: center;
		padding-top: 8px;
		color: var(--color-subtle);
	}
	nav#mobile_nav > div.selected {
		color: var(--color-highlight);
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
	align-items: center;
	padding: 2px;
	gap: 5px;
}
ul .tool {
	display: inline-flex;
	width: 40px;
	justify-content: center;
}

h3 {
	color: var(--color-subtle);
	margin-top: 20px;
	padding: 5px;
	user-select: none;
}
#scene_list {
	flex-grow: 1;
	overflow-y: auto;
}
.scene {
	height: 36px;
	display: flex;
	padding: 2px 4px;
	align-items: center;
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
	cursor: grab;
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
	margin-bottom: 18px;
	padding: 2px 6px;
	align-items: center;
	list-style: none;
	overflow-y: auto;
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
	min-width: 60px;
	user-select: none;
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
