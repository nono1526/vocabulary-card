<script>
  import Card from './Card.svelte'
  import CardMaker from './CardMaker.svelte'
  import { useDB } from './db.js'
  import AButton from './AButton.svelte'

  let vocabularies = [{
    id: 1,
    en: 'Nono',
    partOfSpeech: 'n',
    tw: '帥哥'
  }, {
    id: 2,
    en: 'Dica',
    partOfSpeech: 'n',
    tw: '可愛小狗'
  }]

  function addCard (card) {
    console.log('card', card)
    vocabularies.push(card.detail)
    vocabularies = vocabularies
  }

  function syncDB (data) {
    add(data)
  }

  const { add, getAll } = useDB()
  
  async function fetchAll () {
    vocabularies = await getAll()
    console.log(vocabularies)
  }
</script>

<main>
  <AButton on:click={syncDB(vocabularies)}>SAVE TO DB</AButton>
  <AButton on:click={fetchAll}>GET ALL</AButton>
  
  <CardMaker on:add-card={addCard}/>
  {#each vocabularies as vocabulary }
    <Card {...vocabulary}>This is my card</Card>
  {/each}
</main>

<style>

</style>