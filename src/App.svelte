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

  async function syncDB (data) {
    add(data)
  }

  async function resetCardDBTable () {
    await clearAll()
    vocabularies = await getAll()
    // window.setTimeout(() => {}, 1000)
  }

  function removeCard (vocabulary) {
    const index = vocabularies.indexOf(vocabulary)
    const isIndexExists = index !== -1
    isIndexExists && (
      vocabularies.splice(index, 1)
    )
    vocabularies = vocabularies
  }

  const { add, getAll, clearAll } = useDB(async () => {
    vocabularies = await getAll()
  })
</script>

<main>
  {vocabularies}
  <AButton on:click={syncDB(vocabularies)}>SAVE TO DB</AButton>
  <AButton on:click={resetCardDBTable}>Clear Card Table in DB</AButton>
  <CardMaker on:add-card={addCard}/>
  {#each vocabularies as vocabulary }
    <Card {...vocabulary}>This is my card</Card>
    <button on:click={(e) => removeCard(vocabulary)}>Remove</button>
  {/each}
</main>

<style>

</style>