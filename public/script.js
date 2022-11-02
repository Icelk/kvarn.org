// @ts-check
/**
 * @type { {[name: string]: {backlog: Event[], inTimeout: boolean}} }
 */
let throttleInstances = {}
/**
 * Throttles calling `callback` to every `interval` milliseconds.
 * If more than one event is supplied in the hang period, only the last is emitted.
 * If a event is emitted in the hang period, that is given to `callback` after the timeout.
 *
 * @param {Event} ev
 * @param {string} name
 * @param {number} interval
 * @param {(ev: Event) => void} callback
 */
function throttle(ev, name, interval, callback) {
    if (throttleInstances[name] === undefined) {
        throttleInstances[name] = {
            backlog: [],
            inTimeout: false,
        }
    }

    let instance = throttleInstances[name]

    if (instance.inTimeout) {
        instance.backlog.push(ev)
        return
    }

    callback(ev)

    instance.inTimeout = true
    setTimeout(() => {
        instance.inTimeout = false
        let item = instance.backlog.pop()

        if (item !== undefined) {
            instance.backlog.length = 0
            callback(item)
        }
    }, interval)
}
/**
 * @param {string} location
 * @param { boolean } newTab
 */
const to = (location, newTab = false) => {
    if (newTab) {
        window.open(location, "_blank")
    } else {
        window.location.href = location
    }
}

const initTopBar = () => {
    const iterateChildren = (parent) => {
        const children = parent.children

        for (let childIndex = 0; childIndex < children.length; childIndex++) {
            const child = children[childIndex]
            let link = child.getAttribute("href")
            if (link === null) {
                continue
            }

            if (link === window.location.pathname) {
                child.classList.add("visiting")
                child.addEventListener("click", (e) => {
                    if (e.metaKey || e.ctrlKey) {
                        return
                    }
                    document.documentElement.scrollTo({ top: 0, behavior: "smooth" })
                    e.preventDefault()
                })
                return
            }
        }
        for (let child = 0; child < children.length; child++) {
            iterateChildren(children[child])
        }
    }
    const topBar = document.getElementById("top-bar")
    iterateChildren(topBar)
}
const initSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor_link) => {
        anchor_link.addEventListener("click", function (e) {
            e.preventDefault()

            let href = this.getAttribute("href")

            let anchor = document.getElementById(href.substring(1))

            history.replaceState({}, "", href)

            if (anchor !== null) {
                anchor.scrollIntoView({
                    behavior: "smooth",
                })
            }
        })
    })
}
const initCopyHeading = () => {
    // Only enable on
    let metaEnabled = document.querySelector("meta[name='permalinks']")
    let content = metaEnabled?.getAttribute("content")
    if (content !== "enabled" && content !== "not-titles") {
        return
    }

    let queryString = content === "not-titles" ? "h2, h3, h4, h5, h6" : "h1, h2, h3, h4, h5, h6"

    document.querySelectorAll(queryString).forEach((heading) => {
        let id = heading.getAttribute("id")
        if (id !== undefined) {
            let linkButton = document.createElement("span")
            linkButton.title = "Copy permalink"
            linkButton.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">\
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />\
            </svg>'
            let linkSVG = linkButton.firstElementChild
            linkButton.onclick = () => {
                let link = `${document.location.href.split("#")[0]}#${id}`
                navigator.clipboard.writeText(link)
                linkSVG.classList.add("pressed")
                setTimeout(() => linkSVG.classList.remove("pressed"), 150)
            }
            linkSVG.classList.add("share-button")
            heading.appendChild(linkButton)
        }
    })
}

initTopBar()
initSmoothScrolling()
initCopyHeading()

/**
 * @param {string | { path: string, rating: number, occurrences: { start: number, ctx_byte_idx: number, ctx_char_idx: number, ctx: string }[] }[] } output
 */
function setSearchOutput(output) {
    /**
     * @param {string} s
     * @returns {string}
     */
    function text(s) {
        return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    }
    if (typeof output == "string") {
        if (output.length === 0) {
            searchOutput.innerHTML = ""
        } else {
            searchOutput.innerHTML = `<a>${output}</a>`
        }
    } else {
        searchOutput.innerHTML = ""
        output.forEach((value, index) => {
            const occurrence = value.occurrences[0]
            const keywordRaw = occurrence.ctx.substring(occurrence.ctx_char_idx).match(/[a-zA-Z0-9]*/)[0]
            const keyword = text(keywordRaw)
            const pre = occurrence.ctx.substring(0, occurrence.ctx_char_idx)
            const post = occurrence.ctx.substring(occurrence.ctx_char_idx + keywordRaw.length)
            const context = `... ${pre}<b>${keyword}</b>${post} ...`
            const span = document.createElement("span")
            span.innerHTML = `<a class="uri">${value.path}</a>${context}`
            span.tabIndex = -1
            span.addEventListener("click", (e) => to(value.path, e.metaKey || e.ctrlKey))
            searchOutput.appendChild(span)
        })
    }
}
/**
 * @param {string} query
 */
function search(query) {
    fetch(`/search?q=${encodeURIComponent(query)}`)
        .then(async (response) => {
            if (!response.ok) {
                if (response.status === 404) {
                    setSearchOutput("Server doesn't support search.")
                    return
                }
                let errorMessage = response.headers.get("reason")
                errorMessage = errorMessage === undefined ? "Server error" : `Query error: ${errorMessage}`
                setSearchOutput(errorMessage)
            } else {
                const json = await response.json()
                if (json.length === 0) {
                    setSearchOutput("No search results found.")
                } else {
                    json.length = 5
                    setSearchOutput(json)
                }
            }
        })
        .catch((_err) => setSearchOutput("Servers offfline."))
}

// Search bar in index.
/**
 * @type HTMLInputElement
 */
// we know it's an input
// @ts-ignore
const searchInput = document.getElementById("searchInput")
const searchBoxContainer = document.getElementById("searchBoxContainer")
/**
 * @type HTMLInputElement
 */
// we know it's an input
// @ts-ignore
const searchBoxInput = document.getElementById("searchBoxInput")
const searchOutput = document.getElementById("searchOutput")
if (searchInput !== null) {
    searchInput.addEventListener("input", (e) => {
        searchBoxInput.value = searchInput.value
        searchBoxInput.focus()
        searchBoxInput.dispatchEvent(new InputEvent("input"))
        searchInput.value = ""
    })
    searchBoxInput.addEventListener("input", (e) => {
        throttle(e, "search", 300, (_) => {
            const query = searchBoxInput.value
            if (query.length > 0) {
                search(query)
            } else {
                setSearchOutput("")
            }
        })
    })
}

// @ts-ignore
if (typeof hljs !== "undefined") {
    // @ts-ignore
    hljs.highlightAll()
}

let logo = document.getElementById("main-logo")
let changed = false
if (logo !== null) {
    logo.addEventListener("mouseover", async () => {
        // only do this once
        if (changed) {
            return
        }
        const logo_container = document.getElementById("main-logo-container")
        // replace logo with SVG data, so we can manipulate it
        let data = await (await fetch("/logo.svg")).text()
        logo.outerHTML = data
        // @ts-ignore
        logo = logo_container.firstElementChild
        logo.setAttributeNS(null, "viewBox", `64 ${64 * (1 - 0.125 * 2)} 128 ${128 * 1.125}`)
        logo.id = "main-logo"
        let style = document.createElement("style")
        style.innerText =
            "#main-logo:hover #path80, #main-logo:hover #rect3765 { animation: kvarn-rotate 20s linear infinite; transform-origin: 101.1% 75.7%; }\n#main-logo { pointer-events: all; height: calc(var(--height) * 1.125) }"
        logo_container.appendChild(style)
        changed = true
    })
}
