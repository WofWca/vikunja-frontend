import {createFakeUserAndLogin} from '../../support/authenticateUser'

import {TaskFactory} from '../../factories/task'

describe('Project View Table', () => {
	createFakeUserAndLogin()

	it('Should show a table with tasks', () => {
		const tasks = TaskFactory.create(1)
		cy.visit('/projects/1/table')

		cy.get('.project-table table.table')
			.should('exist')
		cy.get('.project-table table.table')
			.should('contain', tasks[0].title)
	})

	it('Should have working column switches', () => {
		TaskFactory.create(1)
		cy.visit('/projects/1/table')

		cy.get('.project-table .filter-container .items .button')
			.contains('Columns')
			.click()
		cy.get('.project-table .filter-container .card.columns-filter .card-content .fancycheckbox .check')
			.contains('Priority')
			.click()
		cy.get('.project-table .filter-container .card.columns-filter .card-content .fancycheckbox .check')
			.contains('Done')
			.click()

		cy.get('.project-table table.table th')
			.contains('Priority')
			.should('exist')
		cy.get('.project-table table.table th')
			.contains('Done')
			.should('not.exist')
	})

	it('Should navigate to the task when the title is clicked', () => {
		const tasks = TaskFactory.create(5, {
			id: '{increment}',
			project_id: 1,
		})
		cy.visit('/projects/1/table')

		cy.get('.project-table table.table')
			.contains(tasks[0].title)
			.click()

		cy.url()
			.should('contain', `/tasks/${tasks[0].id}`)
	})
})