<script>
  import Card from './Card.svelte'
  import CardMaker from './CardMaker.svelte'
  import { useDB } from './db.js'
  import AButton from './AButton.svelte'
  import { onMount } from 'svelte'

  let vocabularies = []

  async function addCard ({detail: vocabulary}) {
    const key = await addItem(vocabulary)
    vocabularies.push({
      ...vocabulary,
      key
    })
    vocabularies = vocabularies
  }
  
  async function resetCardDBTable () {
    await clearAll()
    vocabularies = await getAll()
  }

  function removeCard (vocabulary) {
    const index = vocabularies.indexOf(vocabulary)
    const isIndexExists = index !== -1
    isIndexExists && (
      vocabularies.splice(index, 1)
    )
    vocabularies = vocabularies
    deleteItem(vocabulary.key)
  }

  const { addItem, getAll, clearAll, deleteItem } = useDB(async () => {
    vocabularies = await getAll()
    console.log(vocabularies)
  })
</script>

<main>
  <AButton on:click={resetCardDBTable}>Clear Card Table in DB</AButton>
  <CardMaker on:add-card={addCard}/>
  {#each vocabularies as vocabulary }
    <Card key={vocabulary.key} {...vocabulary}>This is my card</Card>
    <button on:click={(e) => removeCard(vocabulary)}>Remove</button>
  {/each}
</main>

<style>

</style>