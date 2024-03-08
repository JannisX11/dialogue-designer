<template>
	<div id="localization_editor">
		<codemirror
			:model-value="value"
			placeholder="{}"
			:style="{  }"
			
			:indent-with-tab="true"
			:tab-size="2"
			:extensions="codemirror_extensions"
			@change="changeValue($event)"
		/>
	</div>
</template>

<script>
import { ToggleLeft, ToggleRight, User, Plus, Baseline, Globe, Braces, X } from 'lucide-vue-next'
import { lineNumbers } from '@codemirror/view'
import Codemirror from 'vue-codemirror6'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'

export default {
	components: {
		Codemirror,
	},
	props: {
		languages: Object,
	},
	data() {
		return {
			codemirror_extensions: [oneDark, json(), lineNumbers()],
			value: ''
		}
	},
	methods: {
		changeValue(value) {
			
		}
	}
}
</script>

<style scoped>


</style>

<style>
#properties .ͼ1 {
	flex-grow: 1;
}
#editor_popup .vue-codemirror {
	height: calc(100% - 28px);
	border: 1px solid var(--color-border);
}
#editor_popup .ͼ1 {
	height: 100%;
}
</style>