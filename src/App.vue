<script setup>
import SceneEditor from './components/SceneEditor.vue'
</script>

<template>
	<div id="wrapper">
		<header>
			<h1>DIALOGUE DESIGNER</h1>
		</header>
		<div id="sidebar">
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
			<SceneEditor v-if="selected_scene" id="scene_editor" :scene="selected_scene"></SceneEditor>
		</main>
	</div>
</template>


<script>

import { Scene } from './scripts/scene';
import { Plus, MessageSquare } from 'lucide-vue-next'


export default {
	components: {
		SceneEditor
	},
	data() {
		return {
			scenes: Scene.all,
			selected_scene: null,
			renaming_scene: false
		}
	},
	methods: {
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
}

.tool {
	display: flex;
	cursor: pointer;
	height: 30px;
	align-items: center;
	padding: 2px;
}
.tool:hover {
	color: var(--color-highlight);
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
