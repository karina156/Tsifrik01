const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

initMenu()
initTopics()
initCharacters()
initSubscribeForm()
initModal()

// Экран 1, Экран 10: мобильное меню
function initMenu() {
    const menu = document.querySelector('.menu')
    const openButton = document.querySelector('.js-menu-open')

    const closeMenu = () => {
        menu.hidden = true
        openButton.setAttribute('aria-expanded', 'false')
        document.body.classList.remove('is-locked')
    }

    openButton.addEventListener('click', () => {
        menu.hidden = false
        openButton.setAttribute('aria-expanded', 'true')
        document.body.classList.add('is-locked')
        menu.querySelector('.js-menu-close').focus()
    })

    menu.querySelector('.js-menu-close').addEventListener('click', () => {
        closeMenu()
        openButton.focus()
    })

    menu.querySelectorAll('.js-menu-link').forEach((link) => {
        link.addEventListener('click', closeMenu)
    })

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !menu.hidden) closeMenu()
    })
}

// Экран 4: карточки интерактивов сворачиваются по кнопке «+»
function initTopics() {
    document.querySelectorAll('.js-topic-toggle').forEach((button) => {
        const topic = button.closest('.topic')
        const title = topic.querySelector('h3 img').alt

        button.addEventListener('click', () => {
            const isOpen = topic.classList.toggle('is-open')
            button.setAttribute('aria-expanded', String(isOpen))
            button.setAttribute('aria-label', `${isOpen ? 'Свернуть' : 'Развернуть'} «${title}»`)
        })
    })
}

// Персонажи: короткая смешная анимация по клику
function initCharacters() {
    document.querySelectorAll('.character').forEach((character) => {
        character.addEventListener('click', () => {
            character.classList.remove('is-playing')
            // перезапуск анимации, если кликнули ещё раз
            void character.offsetWidth
            character.classList.add('is-playing')
        })

        character.addEventListener('animationend', (event) => {
            if (event.animationName === 'character-play') character.classList.remove('is-playing')
        })
    })
}

// Экран 6: проверка почты и отправка формы.
// Бэкенд подключается через action формы; без него успех не показываем.
function initSubscribeForm() {
    const form = document.querySelector('.js-subscribe-form')
    const input = form.querySelector('input[type="email"]')
    const button = form.querySelector('[type="submit"]')
    const status = document.querySelector('.js-form-status')

    const showStatus = (text, state) => {
        status.textContent = text
        status.classList.toggle('is-success', state === 'success')
        form.classList.toggle('is-error', state === 'error')
        form.classList.toggle('is-success', state === 'success')
        input.setAttribute('aria-invalid', String(state === 'error'))
    }

    input.addEventListener('input', () => {
        if (form.classList.contains('is-error')) showStatus('', null)
    })

    form.addEventListener('submit', async (event) => {
        event.preventDefault()
        const email = input.value.trim()

        if (!EMAIL_PATTERN.test(email)) {
            showStatus(email ? 'проверь почту: похоже, в ней опечатка' : 'введи почту', 'error')
            input.focus()
            return
        }

        if (!form.action || form.getAttribute('action') === '') {
            showStatus('форма пока не подключена к серверу', 'error')
            return
        }

        button.disabled = true

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' },
            })

            if (!response.ok) throw new Error(response.status)

            form.reset()
            showStatus('', 'success')
            openModal()
        } catch (error) {
            showStatus('не получилось отправить, попробуй ещё раз', 'error')
        } finally {
            button.disabled = false
        }
    })
}

// Экран 11: окно «ты в списке!»
let lastFocused = null

function initModal() {
    const modal = document.querySelector('.js-modal')

    modal.querySelectorAll('.js-modal-close').forEach((button) => {
        button.addEventListener('click', closeModal)
    })

    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal()
    })

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.hidden) closeModal()
    })
}

function openModal() {
    const modal = document.querySelector('.js-modal')
    lastFocused = document.activeElement
    modal.hidden = false
    document.body.classList.add('is-locked')

    requestAnimationFrame(() => {
        modal.classList.add('is-open')
        modal.querySelector('.modal__window').focus()
    })
}

function closeModal() {
    const modal = document.querySelector('.js-modal')
    modal.classList.remove('is-open')
    document.body.classList.remove('is-locked')

    const hide = () => {
        modal.hidden = true
        if (lastFocused) lastFocused.focus()
    }

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTimeout(hide, isReduced ? 0 : 250)
}
