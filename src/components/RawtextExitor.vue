<template>
	<dialog id="rawtext_editor" ref="dialog">
		<div class="editor_popup_bar">
			<X :size="20" @click="close()" />
		</div>
		<textarea
			v-if="text_field"
			v-model="text_field.json"
			@input="changeValue($event)"
		/>
		<p v-if="popup_error" class="json_error">{{ popup_error }}</p>
		<button @click="close()">Confirm</button>
	</dialog>
</template>

<script lang="ts">
import { X } from 'lucide-vue-next';
import { defineComponent } from 'vue';
import { TextField } from '../scripts/text_field';


export default defineComponent({
	components: {
		X
	},
	emits: ['save'],
	data() {
		interface Options {
			text_field: TextField | null
			popup_error: string
		}
		let data: Options = {
			text_field: null,
			popup_error: ''
		}
		return data;
	},
	methods: {
		open() {
			this.$refs.dialog.showModal();
		},
		close() {
			let error_before = !!this.popup_error;
			this.popup_error = '';
			try {
				JSON.parse(this.text_field.json);
			} catch (err) {
				this.popup_error = err.toString();
			}
			if (!this.popup_error) {
				this.$refs.dialog.close();
			} else if (error_before) {
				window.alert('Please fix all JSON issues before closing the Raw JSON editor!')
			}
		},
		changeValue(value) {

		}
	}
})
</script>

<style scoped>

#rawtext_editor {
	width: 750px;
	height: 500px;
}
#rawtext_editor textarea {
	background-color: var(--color-editor);
	font-family: Consolas, monospace;
	padding: 4px 8px;
	font-size: 17px;
	color: inherit;
	background-color: var(--color-editor);
	height: calc(100% - 74px);
	width: 100%;
}
#rawtext_editor .json_error  {
	float: left;
	color: #e8475f;
}
.editor_popup_bar {
	text-align: right;
}
#rawtext_editor button {
	float: right
}
</style>

<style>
#rawtext_editor .vue-codemirror {
	height: calc(100% - 58px);
	border: 1px solid var(--color-border);
}
#rawtext_editor .ͼ1 {
	height: 100%;
}
</style>