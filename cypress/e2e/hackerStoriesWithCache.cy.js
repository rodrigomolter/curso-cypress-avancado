describe('Hacker Stories - E2E', { baseUrl: 'https://hackernews-seven.vercel.app' }, () => {
  const newTerm = 'Node'
  beforeEach(() => {
    cy.intercept(
      '**/search?query=redux&page=0&hitsPerPage=100',
      { fixture: 'empty' }
    ).as('getEmptyStories')
    cy.intercept(
            `**/search?query=${newTerm}&page=0&hitsPerPage=100`,
            { fixture: 'mockedInitialTerm' }
    ).as('getNewStories')

    cy.visit('/')
    cy.wait('@getEmptyStories')
  })
  it('Sucessfully cache the result', () => {
    const faker = require('faker')
    const randomWord = faker.random.word()
    let totalRequests = 0

    cy.intercept(`**/search?query=${randomWord}**`,
      req => {
        totalRequests += 1
        req.reply({ fixture: 'empty' })
      }).as('getRandomStories')

    cy.search(randomWord).then(() => {
      expect(totalRequests, `network calls to fetch ${randomWord}`).to.equal(1)

      cy.wait('@getRandomStories')

      cy.search(newTerm)
      cy.wait('@getNewStories')

      cy.search(randomWord).then(() => {
        expect(totalRequests, `network calls to fetch ${randomWord}`).to.equal(1)
      })
    })
  })
})
