<script>
  import Card from './Card.svelte'
  import CardMaker from './CardMaker.svelte'
  import { useDB } from './db.js'
  import AButton from './AButton.svelte'

  let vocabularies = []

  async function addCard ({ detail: vocabulary }) {
    const key = await addItem(vocabulary)
    vocabularies.push({
      ...vocabulary,
      isFront: true,
      key
    })
    vocabularies = vocabularies
  }
  
  async function resetCardDBTable () {
    await clearAll()
    vocabularies = []
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

  function rotateCard (vocabulary) {
    vocabulary.isFront = !vocabulary.isFront
    vocabularies = vocabularies // svelte need to reload array
  }

  function initVocabulary () {
    vocabularies = vocabularies.map(vocabuary => ({
      ...vocabuary,
      isFront: true
    }))
  }

  const { addItem, getAll, clearAll, deleteItem } = useDB(async () => {
    vocabularies = await getAll()
    initVocabulary()
  })
</script>


<style>
  .card__container {
    display: flex;
    flex-wrap: wrap;
  }

  .card__wrapper {
    position: relative;
    margin: 12px
  }
  
  .card__cancel-btn {
    position: absolute;
    right: 0;
    top: 0;
    margin: 8px;
    width: 20px;
    height: 20px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    outline: none;
  }
  
  .title {
    font-weight: normal;
    margin: 12px 0;
    color: #171717;
  }
</style>

<main>
  <AButton on:click={resetCardDBTable}>Clear Card Table in DB</AButton>
  <h2 class="title">Add Card</h2>
  <CardMaker on:add-card={addCard}/>
  <h2 class="title">Cards</h2>
  <div class="card__container">
    {#each vocabularies as vocabulary (vocabulary.key) }
      <div class="card__wrapper">
        <Card
          on:click={rotateCard(vocabulary)}
          {...vocabulary}></Card>
        <button class="card__cancel-btn" on:click={removeCard(vocabulary)}>x</button>
      </div>
    {/each}
  </div>
</main>
