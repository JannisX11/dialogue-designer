<script setup>
import SceneEditor from './components/SceneEditor.vue'
</script>

<template>
	<div id="wrapper" :mobile_page="mobile_page">
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
			<div class="form_bar">
				<label>File Name</label>
				<input type="text" v-model="Project.name">
			</div>
			<div class="form_bar">
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
			<ul>
				<li v-for="scene in scenes" :key="scene.uuid"
					class="scene"
					:class="{selected: scene == selected_scene, a: true}" 
					@click="selectScene(scene)"
					@dblclick="renameScene(scene)"
				>
					<MessageSquare />
					<input type="text" v-model="scene.id" :readonly="scene == selected_scene && renaming_scene ? false : true" spellcheck="false" @blur="renaming_scene = false">
				</li>
			</ul>

		</div>
		<main>
			<SceneEditor v-if="selected_scene" :scene="selected_scene"></SceneEditor>
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
import { selectFileToImport } from './scripts/import'
import { exportDialogueFile } from './scripts/export'

Scene.all = reactive(Scene.all);

export default {
	components: {
		SceneEditor
	},
	data() {
		return {
			scenes: Scene.all,
			project: Project,
			selected_scene: null,
			renaming_scene: false,
			mobile_page: 'sidebar'
		}
	},
	methods: {
		importFile() {
			selectFileToImport();
		},
		saveFile() {
			exportDialogueFile();
		},
		addScene() {
			let scene = new Scene();
			this.selectScene(scene);
		},
		selectScene(scene) {
			this.selected_scene = scene;
			Scene.selected = scene;
		},
		renameScene(scene) {
			this.renaming_scene = true;
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

</style>
