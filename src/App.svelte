<script>
  import Card from './Card.svelte'
  import CardMaker from './CardMaker.svelte'
  let vocabularies = [{
    en: 'Nono',
    partOfSpeech: 'n',
    tw: '帥哥'
    
  }, {
    en: 'Dica',
    partOfSpeech: 'n',
    tw: '可愛小狗'
  }]
  function addCard (card) {
    console.log('card', card)
    vocabularies.push(card.detail)
    vocabularies = vocabularies
  }
</script>

<main>
  <CardMaker on:add-card={addCard}/>
  {#each vocabularies as vocabulary }
    <Card {...vocabulary}>This is my card</Card>
  {/each}
</main>

<style>

</style>