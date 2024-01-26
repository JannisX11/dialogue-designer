<script setup>
import SceneEditor from './components/SceneEditor.vue'
</script>

<template>
  <main>
    <header>
      <Plus :size="24" />
      Header
    </header>
    <div id="sidebar">
      Sidebar
      <ul>
        <li v-for="scene in scenes" :class="{selected: scene == selected_scene}" :key="scene.uuid">
          <label>{{ scene.id }}</label>
        </li>
      </ul>
    </div>
    <SceneEditor v-if="selected_scene" id="scene_editor" :scene="selected_scene"></SceneEditor>
  </main>
</template>


<script>

import { Scene } from './scripts/scene';
import { Plus } from 'lucide-vue-next'


export default {
  data() {
    return {
      scenes: Scene.all,
      selected_scene: null
    }
  }
}
</script>

<style scoped>
main {
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
#sidebar {
  grid-area: sidebar;
  border-right: 1px solid var(--color-border);
}
#scene_editor {
  grid-area: editor;
}

</style>
