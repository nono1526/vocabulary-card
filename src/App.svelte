<script>
  import Card from './Card.svelte'
  import CardMaker from './CardMaker.svelte'
  import { useDB } from './db.js'
  import AButton from './AButton.svelte'
  import { onMount } from 'svelte'

  let vocabularies = []

  function addCard (card) {
    console.log('card', card)
    vocabularies.push(card.detail)
    vocabularies = vocabularies
  }

  function syncDB (data) {
    add(data)
  }

  const { add, getAll } = useDB(async () => {
    vocabularies = await getAll()
  })
</script>

<main>
  <AButton on:click={syncDB(vocabularies)}>SAVE TO DB</AButton>
  
  <CardMaker on:add-card={addCard}/>
  {#each vocabularies as vocabulary }
    <Card {...vocabulary}>This is my card</Card>
  {/each}
</main>

<style>

</style>