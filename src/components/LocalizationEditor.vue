<template>
	<div id="localization_editor">
		<div id="properties_bar" v-if="language">
			<input id="lang_title" v-model="language.id" list="lang_id_list" />
		</div>
		<div ref="editor_anchor" class="loc_editor_anchor" :class="{has_content: language.content.length > 0}"></div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ToggleLeft, ToggleRight, User, Plus, Baseline, Globe, Braces, X } from 'lucide-vue-next'
import { LangFile, lang_names } from '../scripts/lang_file'
import { createDatalist } from '../scripts/util'

import { lineNumbers, keymap, ViewUpdate } from '@codemirror/view'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import {EditorView, basicSetup} from "codemirror"
import {EditorState} from "@codemirror/state"
import {tags} from "@lezer/highlight"
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'

createDatalist('lang_id_list', lang_names);

export default {
	components: {
	},
	props: {
		language: LangFile,
	},
	watch: {
		language(lang) {
			if (lang) this.setupLangFile(lang)
		}
	},
	data() {
		return {
			editing_name: false,
			editor: null
		}
	},
	methods: {
		setupLangFile(lang: LangFile) {
			let editor_state = EditorState.create({
				doc: lang.content,
				extensions: [
					EditorView.updateListener.of((v: ViewUpdate) => {
						if (v.docChanged) {
							lang.content = v.state.doc.toString();
						}
					}),
					oneDark,
					json(),
					lineNumbers(), 
				]
			});
			this.editor.setState(editor_state);
		}
	},
	mounted() {
		let editor = new EditorView({
			parent: this.$refs.editor_anchor,
		})
		this.editor = editor;
		this.setupLangFile(this.language);
	}
}
</script>

<style scoped>

#lang_title {
	background: none;
	border: none;
	font-size: 22px;
	height: 100%;
	width: 140px;
	padding: 4px 12px;
}
#localization_editor {
	height: 100%;
}
#properties_bar {
	height: 44px;
}
#properties_bar > label {
	display: inline-block;
	font-size: 23px;
	padding: 4px 8px;
}
textarea {
	height: calc(100% - 56px);
	border: none;
	border-top: 1px solid var(--color-border);
	border-bottom: 1px solid var(--color-border);
	background: no-repeat;
	width: 100%;
	padding: 4px 8px;
	font-size: 17px;
	background-color: var(--color-editor);
}

</style>
<style>
.loc_editor_anchor {
	height: calc(100% - 45px);
}
.loc_editor_anchor > * {
	height: 100%;
	overflow-y: scroll;
	overflow-y: auto;
}

</style>