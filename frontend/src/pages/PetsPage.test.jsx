import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PetsPage from './PetsPage'
import { getMyPets, createPet, updatePet, deletePet, uploadPetPhoto, deletePetPhoto, getPetPhoto } from '../api/pets'
import { resizeImage } from '../utils/resizeImage'
import { clearPetPhotoCache } from '../utils/petPhotos'

vi.mock('../api/pets', () => ({
    getMyPets: vi.fn(),
    createPet: vi.fn(),
    updatePet: vi.fn(),
    deletePet: vi.fn(),
    uploadPetPhoto: vi.fn(),
    deletePetPhoto: vi.fn(),
    getPetPhoto: vi.fn(),
}))
vi.mock('../utils/resizeImage', () => ({ ACCEPTED_PHOTO_TYPES: ['image/jpeg', 'image/png'], resizeImage: vi.fn() }))

const POPI = { id: 1, name: 'Popi', species: 'DOG', lifeStage: 'ADULT', hasPhoto: false }

function renderPage() {
    return render(
        <MemoryRouter>
            <PetsPage />
        </MemoryRouter>
    )
}

const photoInput = (container) => container.querySelector('input[type="file"]')

describe('PetsPage', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        clearPetPhotoCache()
        URL.createObjectURL = vi.fn(() => 'blob:preview')
        URL.revokeObjectURL = vi.fn()
        getPetPhoto.mockResolvedValue({ data: new Blob(['x'], { type: 'image/jpeg' }) })
    })

    it('shows the life stage in Spanish', async () => {
        getMyPets.mockResolvedValue({ data: [{ ...POPI, lifeStage: 'PUPPY' }] })
        renderPage()
        expect(await screen.findByText('Perro · Cachorro')).toBeInTheDocument()
    })

    it('invites to register the first pet when there are none', async () => {
        getMyPets.mockResolvedValue({ data: [] })
        renderPage()
        expect(await screen.findByText('Aún no tienes mascotas registradas')).toBeInTheDocument()
    })

    it('lets the user retry when the pets cannot be loaded', async () => {
        getMyPets.mockRejectedValueOnce({ isAxiosError: true }).mockResolvedValue({ data: [POPI] })
        const user = userEvent.setup()
        renderPage()

        expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor.')
        await user.click(screen.getByRole('button', { name: 'Reintentar' }))
        expect(await screen.findByText('Popi')).toBeInTheDocument()
    })

    it('shows the pet photo when it has one', async () => {
        getMyPets.mockResolvedValue({ data: [{ ...POPI, hasPhoto: true, photoVersion: 'abc12345' }] })
        const { container } = renderPage()

        await waitFor(() => expect(container.querySelector('img[src="blob:preview"]')).toBeInTheDocument())
        expect(getPetPhoto).toHaveBeenCalledWith(1)
    })

    it('uploads the chosen photo after creating the pet', async () => {
        getMyPets.mockResolvedValue({ data: [] })
        createPet.mockResolvedValue({ data: { ...POPI, id: 7 } })
        uploadPetPhoto.mockResolvedValue({ data: {} })
        const resized = new Blob(['small'], { type: 'image/jpeg' })
        resizeImage.mockResolvedValue(resized)
        const user = userEvent.setup()
        const { container } = renderPage()

        await user.click(await screen.findByRole('button', { name: /nueva mascota/i }))
        await user.upload(photoInput(container), new File(['big'], 'popi.jpg', { type: 'image/jpeg' }))
        expect(await screen.findByText('Cambiar foto')).toBeInTheDocument()
        await user.type(screen.getByLabelText('Nombre'), 'Popi')
        await user.selectOptions(screen.getByLabelText('Especie'), 'DOG')
        await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

        await waitFor(() => expect(uploadPetPhoto).toHaveBeenCalledWith(7, resized))
    })

    it('rejects files that are not JPG or PNG before uploading', async () => {
        getMyPets.mockResolvedValue({ data: [POPI] })
        const user = userEvent.setup({ applyAccept: false })
        const { container } = renderPage()

        await user.click(await screen.findByRole('button', { name: /editar/i }))
        await user.upload(photoInput(container), new File(['gif'], 'popi.gif', { type: 'image/gif' }))

        expect(screen.getByRole('alert')).toHaveTextContent('Elige una foto JPG o PNG.')
        expect(resizeImage).not.toHaveBeenCalled()
    })

    it('removes the photo when the owner asks for it', async () => {
        const withPhoto = { ...POPI, hasPhoto: true, photoVersion: 'abc12345' }
        getMyPets.mockResolvedValue({ data: [withPhoto] })
        updatePet.mockResolvedValue({ data: withPhoto })
        deletePetPhoto.mockResolvedValue({ data: { ...POPI } })
        const user = userEvent.setup()
        renderPage()

        await user.click(await screen.findByRole('button', { name: /editar/i }))
        await user.click(screen.getByRole('button', { name: 'Quitar foto' }))
        await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

        await waitFor(() => expect(deletePetPhoto).toHaveBeenCalledWith(1))
    })

    it('keeps the pet and explains when the photo could not be uploaded', async () => {
        getMyPets.mockResolvedValue({ data: [POPI] })
        updatePet.mockResolvedValue({ data: POPI })
        uploadPetPhoto.mockRejectedValue({ isAxiosError: true, response: { status: 413 } })
        resizeImage.mockResolvedValue(new Blob(['small'], { type: 'image/jpeg' }))
        const user = userEvent.setup()
        const { container } = renderPage()

        await user.click(await screen.findByRole('button', { name: /editar/i }))
        await user.upload(photoInput(container), new File(['big'], 'popi.png', { type: 'image/png' }))
        await user.click(await screen.findByRole('button', { name: 'Guardar cambios' }))

        const alert = await screen.findByText(/la mascota se guardó, pero la foto no/i)
        expect(alert).toHaveTextContent('La foto pesa demasiado.')
    })

    it('opens the form in a dialog that closes with Escape', async () => {
        getMyPets.mockResolvedValue({ data: [POPI] })
        const user = userEvent.setup()
        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Editar perfil' }))
        expect(screen.getByRole('dialog', { name: 'Editar perfil de Popi' })).toBeInTheDocument()
        expect(screen.getByLabelText('Nombre')).toHaveFocus()

        await user.keyboard('{Escape}')
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('deletes a pet after confirming', async () => {
        getMyPets.mockResolvedValueOnce({ data: [POPI] }).mockResolvedValue({ data: [] })
        deletePet.mockResolvedValue({})
        const user = userEvent.setup()
        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Más opciones para Popi' }))
        await user.click(screen.getByRole('menuitem', { name: 'Eliminar mascota' }))
        expect(screen.getByRole('dialog', { name: '¿Eliminar a Popi?' })).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'Eliminar' }))

        await waitFor(() => expect(deletePet).toHaveBeenCalledWith(1))
        expect(await screen.findByText('Aún no tienes mascotas registradas')).toBeInTheDocument()
    })

    it('does not delete when the owner cancels', async () => {
        getMyPets.mockResolvedValue({ data: [POPI] })
        const user = userEvent.setup()
        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Más opciones para Popi' }))
        await user.click(screen.getByRole('menuitem', { name: 'Eliminar mascota' }))
        await user.click(screen.getByRole('button', { name: 'Cancelar' }))

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        expect(deletePet).not.toHaveBeenCalled()
    })

    it('stops offering new pets at the limit of five', async () => {
        const five = [1, 2, 3, 4, 5].map((id) => ({ ...POPI, id, name: `Mascota ${id}` }))
        getMyPets.mockResolvedValue({ data: five })
        renderPage()

        expect(await screen.findByText('Mascota 5')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /nueva mascota/i })).toBeDisabled()
        expect(screen.queryByRole('button', { name: /agregar mascota/i })).not.toBeInTheDocument()
    })
})