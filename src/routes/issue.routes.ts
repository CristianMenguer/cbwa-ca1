import { Router, Request, Response } from 'express'
import AppError from '../errors/AppError'
import ensureAuthenticated from '../middlewares/ensureAuthenticated'
import { getAll, getByProjectSlug, getBySlugNumber } from '../models/issue'
import CreateIssueService from '../services/CreateIssueService'
import { isNumber } from '../services/ValidateInputs'

const issueRoutes = Router()

issueRoutes.use(ensureAuthenticated)

issueRoutes.post('/', async (request: Request, response: Response) => {
    try {
        const { title, description, project_id } = request.body

        if (!title || !description || !project_id)
            throw new AppError('It is missing some parameters!')

        const createIssue = new CreateIssueService()

        const issue = await createIssue.execute({
            title,
            description,
            project_id
        })

        return response.json(issue)

    } catch (err) {
        return response.status(409).json({ error: err.message })
    }
})

issueRoutes.get('/:slugNumber', async (request: Request, response: Response) => {

    const { slugNumber } = request.params

    const splitString = slugNumber.split('-')
    //
    if (splitString.length != 2)
        throw new AppError('Format slug-number not found!')
    //
    const [ slug, issueNumber ] = splitString
    //
    if (!isNumber(issueNumber))
        throw new AppError('Format slug-number not found!')
    //
    const issues = await getBySlugNumber(slug, issueNumber)

    for (const issue of issues) {
        delete issue.created_at
        delete issue.updated_at
        delete issue.project?.updated_at
        delete issue.project?.created_at
    }

    return response.json(issues)
})

issueRoutes.get('/', async (request: Request, response: Response) => {
    const issues = await getAll()

    for (const issue of issues) {
        delete issue.created_at
        delete issue.updated_at
        delete issue.project?.updated_at
        delete issue.project?.created_at
    }

    return response.json(issues)
})

export default issueRoutes