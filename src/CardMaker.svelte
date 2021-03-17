<script>
  import { createEventDispatcher } from 'svelte'
  import Card from './Card.svelte'
  import AButton from './AButton.svelte'
  let isFront = true
  let en = 'Hello'
  let tw = '你好'
  let partOfSpeech = 'n.'
  let example = 'example sentences'
  const dispatcher = createEventDispatcher()
</script>

<style>
.my-1 {
  margin: 4px 0;
}
.card-maker {
  position: relative;
  max-width: fit-content;
}
.card-maker__add-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 4px;
  padding-right: 8px;
}

.card-maker__rotate-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 8px;
  padding-left: 8px;
}
</style>

<div class="card-maker">
  <Card
    bind:partOfSpeech={partOfSpeech}
    bind:en={en}
    bind:tw={tw}
    bind:example
    isFront={isFront}
    editable={true}>
  </Card>
  <div class="my-1 card-maker__add-btn">
    <AButton
      dark
      on:click={(e) => dispatcher('add-card', {
        en,
        tw,
        partOfSpeech,
        example
      })}
    >ADD</AButton>
  </div>
  <div class="card-maker__rotate-btn">
    <AButton dark on:click="{e => isFront = !isFront}">
      ROTATE
    </AButton>
  </div>
</div>