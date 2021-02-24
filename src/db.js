import { onDestroy, onMount } from 'svelte'

const cards = []

let db

const DB_VERSION = 3

const DB_NAME = 'Flashcard'

function _init () {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = e => {
      console.error('init indexed db error')
      console.error(e.target.errorCode)
      reject(e)
    }
    request.onsuccess = e => {
      resolve(e.target.result)
    }

    request.onupgradeneeded = e => {
      db = e.target.result
      console.log('indexed db upgradeneeded')
      const objectStore = db.createObjectStore('cards', { autoIncrement: true });
      console.log(objectStore)
    };
  
  })
}

export function useDB () {
  onMount(async () => {
    db = await _init()
  })

  onDestroy(() => {
    db.close()
  })

  const getAll = async () => {
    return new Promise((resolve, reject) => {
      const objectStore = db
      .transaction(['cards'], 'readwrite')
      .objectStore('cards')

      objectStore.openCursor().onsuccess = e => {
        const cursor = e.target.result

        if (cursor) {
          cards.push(cursor.value)
          cursor.continue()
        } else {
          console.log('get all finish!', cards)
          resolve(cards)
        }
      }
    })
  }

  const add = async insertedItems => {
    const transaction = db.transaction(['cards'], 'readwrite')
    transaction.oncomplete = function(event) {
      console.log('All done!');
    }
    const objectStore = transaction.objectStore('cards')
    for (let i in insertedItems) {
      let request = objectStore.add(insertedItems[i])
      request.onsuccess = e => {
        console.log(e)
      }
    }
  }

  return {
    add,
    getAll
  }
}