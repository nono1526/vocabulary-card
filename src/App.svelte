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
</script>

<main>
  <CardMaker/>
  {#each vocabularies as vocabulary }
    <Card {...vocabulary}>This is my card</Card>
  {/each}
</main>

<style>

</style>