<script>
  import { createEventDispatcher } from 'svelte'
  import Card from './Card.svelte'
  import AButton from './AButton.svelte'
  let en = 'Hello'
  let tw = '你好'
  const dispatcher = createEventDispatcher()
</script>

<style>
.my-1 {
  margin: 4px 0;
}
</style>

<div class="card-maker">
  {en} {tw}
  <Card bind:en={en} bind:tw={tw} editable={true}></Card>
  <div class="my-1">
    <AButton
      on:click={(e) => dispatcher('add-card', {
        en,
        tw
      })}
    >ADD</AButton>
  </div>
</div>