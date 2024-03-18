<template>
	<div id="localization_editor">
		<div id="properties_bar" v-if="language">
			<label>{{ language.id }}</label>
		</div>
		<textarea v-if="language" v-model="language.content" placeholder="key=Value" />
	</div>
</template>

<script>
import { ToggleLeft, ToggleRight, User, Plus, Baseline, Globe, Braces, X } from 'lucide-vue-next'
import { lineNumbers } from '@codemirror/view'
import Codemirror from 'vue-codemirror6'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { LangFile } from '../scripts/lang_file'

export default {
	components: {
		Codemirror,
	},
	props: {
		language: LangFile,
	},
	watch: {
		language(lang) {
			if (lang instanceof LangFile) {
				this.value = lang.content;
			} else {
				this.value = '';
			}
		}
	},
	data() {
		return {
			//codemirror_extensions: [oneDark, json(), lineNumbers()],
			value: ''
		}
	},
	methods: {
		changeValue(value) {
			console.log(value)
			this.language.content = value;
		}
	}
}
</script>

<style scoped>


</style>

<style>
#localization_editor {
	height: 100%;
}
#localization_editor > #properties_bar {
	height: 44px;
}
#localization_editor > #properties_bar > label {
	display: inline-block;
	font-size: 23px;
	padding: 4px 8px;
}
#localization_editor textarea {
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