<template>
	<dialog id="export_dialog">
		Here are the files, ready for implementation into Minecraft

		Download the dialogue file and place it into the "dialogues" folder of your behavior pack. Create the folder if it doesn't already exist.
		Start the game and summon an NPC-type entity.
		Apply the dialogue via
		/dialogue change @e[] dialogue_id

		<template>
			Download the language files and place them into the langs folder of your resource pack.
		</template>
	</dialog>
</template>

<script>

export default {
	data() {
		return {
		}
	},
	methods: {
	}
}
</script>

<style scoped>


</style>
