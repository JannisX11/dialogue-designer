<template>
	<dialog id="export_dialog" ref="dialog" :class="{open: is_open}">

		<h2 style="margin-bottom: 10px;">Export</h2>

		<ol v-if="has_scenes">
			<li>
				<p>Download the dialogue file and place it into the <code>dialogue</code> folder of your behavior pack. Create the folder if it doesn't already exist.</p>
				<div class="file_download">
					<div class="download_button" @click="downloadDialogueFile()">
						<File :size="20" />
						{{ dialogue_file_name }}
					</div>
					<div class="tool" @click="copyDialogueFile()" title="Copy File Contents"><Copy :size="20" /></div>
				</div>
			</li>
			<li v-if="lang_files.length">
				<p>Download the language files and place them into the <code>texts</code> folder of your resource pack</p>

				<div v-for="lang in lang_files" :key="lang" class="file_download">
					<div class="download_button" @click="downloadLangFile(lang)">
						<File :size="20" />
						{{ lang }}.lang
					</div>
					<div class="tool" @click="copyLangFile(lang)" title="Copy File Contents"><Copy :size="20" /></div>
				</div>
			</li>
			<li>
				<p>Start the game and summon an NPC-type entity.</p>
				<p>You can apply the dialogue to your entity by standing next to it and running this command in chat:</p>
				<pre><code>{{ command }}</code><div class="tool copy_tool" @click="copy(command, 'command')"><Copy :size="22" /></div></pre>
			</li>
		</ol>
		<p v-else>No scenes available...</p>

		<div class="button_bar">
			<button @click="close()">Close</button>
		</div>
	</dialog>
</template>

<script>
import { Copy, File } from 'lucide-vue-next';
import { Project } from '../scripts/project';
import { Scene } from '../scripts/scene';
import { compileDialogueFile, exportDialogueFile } from '../scripts/export';
import { LangFile } from '../scripts/lang_file';
import { compileJSON } from '../scripts/util';

export default {
	components: {
		Copy,
		File
	},
	emits: ['save'],
	data() {
		return {
			is_open: false,
			has_scenes: false,
			dialogue_file_name: '',
			command: '',
			lang_files: []
		}
	},
	methods: {
		open() {
			this.$refs.dialog.showModal();
			this.is_open = true;

			this.has_scenes = Scene.all[0] ? true : false;
			if (!this.has_scenes) return;

			this.dialogue_file_name = (Project.name||'unknown') + '.dialogue.json';
			let first_scene_id = Project.prefix + Scene.all[0].id;
			this.command = `/dialogue change @e[family=npc,r=8,c=1] ${first_scene_id}`;

			this.lang_files.splice(0);
			LangFile.all.forEach(lang => {
				this.lang_files.push(lang.id);
			})
		},
		close() {
			this.$refs.dialog.close();
			this.is_open = false;
		},
		copy(text, key) {
			navigator.clipboard.writeText(text);
			if (key) {
				let old = this[key];
				this[key] = 'Copied!';
				setTimeout(() => this[key] = old, 360);
			}
		},
		downloadDialogueFile() {
			exportDialogueFile();
			this.$emit('save');
		},
		downloadLangFile(lang_id) {
			exportLangFile(lang_id);
		},
		copyDialogueFile() {
			let content = compileJSON(compileDialogueFile());
			navigator.clipboard.writeText(content);
		},
		copyLangFile(lang_id) {
			let lang_file = LangFile.all.find(l => l.id == lang_id);
			if (lang_file) {
				navigator.clipboard.writeText(lang_file.content);
			}
		}
	}
}
</script>

<style scoped>
dialog {
	height: fit-content;
}
ol {
	list-style: none;
	counter-reset: point;
}
ol > li {
	margin-bottom: 28px;
	counter-increment: point;
	position: relative;
}
ol > li:before {
	margin-right: 10px;
	content: counter(point);
	text-align: center;
	position: absolute;
	width: 40px;
	left: -40px;
	top: -8px;
	font-size: 29px;
	color: var(--color-subtle);
	font-weight: 300;
}
pre {
	background-color: var(--color-editor);
	border: 1px solid var(--color-border);
	padding: 8px 6px;
	line-height: 24px;
	margin: 8px 0;
	position: relative;
}
.tool.copy_tool {
    position: absolute;
    right: 2px;
    top: 6px;
    height: 30px;
    width: 36px;
    padding: 3px 6px;
}

.file_download {
	display: flex;
	align-items: center;
	margin: 10px 0;
}
.file_download > .tool {
	width: 40px;
}
.file_download > div.download_button {
	background-color: var(--color-hover);
	cursor: pointer;
	padding: 4px 12px;
	flex-grow: 1;
	border-radius: 5px;
}
.file_download > div.download_button:hover {
	background-color: var(--color-hover);
	color: var(--color-highlight);
}
.file_download > div.download_button > svg {
	vertical-align: sub;
}

.button_bar {
	margin-top: auto;
	display: flex;
	justify-content: right;
}
.button_bar button {
	width: 100px;
}

</style>
