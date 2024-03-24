const initialTerm = 'React'
const newTerm = 'Node'
describe('E2E', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      pathname: '**/search',
      query: {
        query: initialTerm,
        page: '0'
      }
    }).as('getStories')
    cy.visit('/')
    cy.wait('@getStories')
  })

  it('shows 20 stories, then the next 20 after clicking "More"', () => {
    cy.intercept({
      method: 'GET',
      pathname: '**/search',
      query: {
        query: initialTerm,
        page: '1'
      }
    }).as('getNextStories')

    cy.get('.item').should('have.length', 20)
    cy.contains('More').should('be.visible').click()

    cy.wait('@getNextStories')
    cy.get('.item').should('have.length', 40)
  })

  it('searches via the last searched term', () => {
    cy.intercept(
      'GET',
        `**/search?query=${newTerm}&page=0`
    ).as('getNewTermStories')

    cy.search(newTerm)
    cy.wait('@getNewTermStories')

    cy.getLocalStorage('search')
      .should('be.equal', newTerm)

    cy.get(`button:contains(${initialTerm})`)
      .should('be.visible')
      .click()

    cy.wait('@getStories')

    cy.getLocalStorage('search')
      .should('be.equal', initialTerm)

    cy.get('.item')
      .should('have.length', 20)

    cy.get('.item')
      .first()
      .should('contain', initialTerm)

    cy.get(`button:contains(${newTerm})`)
      .should('be.visible')
  })
})

describe('API Mocking', () => {
  beforeEach(() => {
    cy.intercept(
      'GET',
      `**/search?query=${initialTerm}&page=0`,
      { fixture: 'smallMockedAnswer' }
    ).as('getMockedAnswer')

    cy.visit('/')
    cy.wait('@getMockedAnswer')
  })

  context('Shows the list of Stories', () => {
    it('shows the footer', () => {
      cy.get('footer')
        .should('be.visible')
        .and('contain', 'Icons made by Freepik from www.flaticon.com')
    })

    it('shows the right data for all rendered stories', () => {
      const smallMockedAnswer = require('../fixtures/smallMockedAnswer')

      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', smallMockedAnswer.hits[0].title)
        .and('contain', smallMockedAnswer.hits[0].author)
        .and('contain', smallMockedAnswer.hits[0].num_comments)
        .and('contain', smallMockedAnswer.hits[0].points)
      cy.get(`.item a:contains(${smallMockedAnswer.hits[0].title})`)
        .should('have.attr', 'href', smallMockedAnswer.hits[0].url)

      cy.get('.item')
        .last()
        .should('be.visible')
        .and('contain', smallMockedAnswer.hits[1].title)
        .and('contain', smallMockedAnswer.hits[1].author)
        .and('contain', smallMockedAnswer.hits[1].num_comments)
        .and('contain', smallMockedAnswer.hits[1].points)
      cy.get(`.item a:contains(${smallMockedAnswer.hits[1].title})`)
        .should('have.attr', 'href', smallMockedAnswer.hits[1].url)
    })

    it('shows one story less after dimissing the first story', () => {
      cy.get('.button-small')
        .first()
        .should('be.visible')
        .click()

      cy.get('.item').should('have.length', 1)
    })
  })

  context('Order by', () => {
    const smallMockedAnswer = require('../fixtures/smallMockedAnswer')
    it('orders by title', () => {
      cy.get('.list-header-button:contains(Title)')
        .as('titleHeader')
        .should('be.visible')
        .click()

      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', smallMockedAnswer.hits[0].title)
      cy.get(`.item a:contains(${smallMockedAnswer.hits[0].title})`)
        .should('have.attr', 'href', smallMockedAnswer.hits[0].url)

      cy.get('@titleHeader')
        .should('be.visible')
        .click()

      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', smallMockedAnswer.hits[1].title)
      cy.get(`.item a:contains(${smallMockedAnswer.hits[1].title})`)
        .should('have.attr', 'href', smallMockedAnswer.hits[1].url)
    })

    it('orders by author', () => {
      cy.get('.list-header-button:contains(Author)')
        .as('authorHeader')
        .should('be.visible')
        .click()

      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', smallMockedAnswer.hits[0].author)

      cy.get('@authorHeader')
        .should('be.visible')
        .click()

      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', smallMockedAnswer.hits[1].author)
    })

    it('orders by comments', () => {
      cy.get('.list-header-button:contains(Comments)')
        .as('commentsHeader')
        .should('be.visible')
        .click()

      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', smallMockedAnswer.hits[1].num_comments)

      cy.get('@commentsHeader')
        .should('be.visible')
        .click()

      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', smallMockedAnswer.hits[0].num_comments)
    })

    it('orders by points', () => {
      cy.get('.list-header-button:contains(Points)')
        .as('pointsHeader')
        .should('be.visible')
        .click()

      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', smallMockedAnswer.hits[1].points)

      cy.get('@pointsHeader')
        .should('be.visible')
        .click()

      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', smallMockedAnswer.hits[0].points)
    })
  })

  context('Search', () => {
    beforeEach(() => {
      cy.intercept(
        'GET',
        `**/search?query=${newTerm}&page=0`,
        { fixture: 'mockedNewTerm.json' }
      ).as('getNewTermMockedAnswer')

      cy.visit('/')
      cy.wait('@getMockedAnswer')

      cy.get('#search')
        .should('be.visible')
        .clear()
    })
    it('types and hits ENTER', () => {
      cy.search(newTerm)

      cy.wait('@getNewTermMockedAnswer')

      cy.get('.item')
        .should('have.length', 20)
      cy.get('.item')
        .contains(newTerm)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')

      cy.getLocalStorage('search')
        .should('be.equal', newTerm)
    })

    it('types and clicks the submit button', () => {
      cy.get('#search')
        .should('be.visible')
        .type(newTerm)
      cy.contains('Submit')
        .should('be.visible')
        .click()

      cy.wait('@getNewTermMockedAnswer')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .contains(newTerm)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')

      cy.getLocalStorage('search')
        .should('be.equal', newTerm)
    })

    it('shows a max of 5 buttons for the last searched terms', () => {
      const faker = require('faker')

      cy.intercept(
        'GET',
        '**/search**',
        { fixture: 'mockedInitialTerm' }
      ).as('getRandomStories')

      Cypress._.times(6, () => {
        const randomWord = faker.random.word()
        cy.search(randomWord)

        cy.getLocalStorage('search')
          .should('be.equal', randomWord)
      })

      cy.wait('@getRandomStories')

      cy.get('.last-searches')
        .within(() => {
          cy.get('button')
            .should('be.visible')
        })
    })

    it('shows no story when none is returned', () => {
      cy.intercept(
        'GET',
        '**/search**',
        { fixture: 'empty' }
      ).as('getRandomStories')
      cy.visit('/')
      cy.get('.item').should('not.exist')
    })
  })
})

describe('Errors', () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { statusCode: 500 }
    ).as('getServerFailure')

    cy.visit('/')
    cy.wait('@getServerFailure')

    cy.get('p:contains(Something went wrong ...)')
      .should('be.visible')
  })

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { forceNetworkError: true }
    ).as('getNetworkError')

    cy.visit('/')
    cy.wait('@getNetworkError')

    cy.get('p:contains(Something went wrong ...)')
      .should('be.visible')
  })

  it('shows a "Loading ..." state before showing the results', () => {
    cy.intercept(
      'GET',
      '**/search**',
      {
        delay: 2000,
        fixture: 'mockedInitialTerm'
      }
    ).as('getDelayedRequest')

    cy.visit('/')
    cy.assertLoadingIsShownAndHidden()
    cy.wait('@getDelayedRequest')

    cy.get('.item').should('have.length', 15)
  })
})
