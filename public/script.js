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

            history.replaceState({}, "", href);

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

let search = document.getElementById("searchInput")
if (search !== null) {
    search.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") {
            return
        }
        let newWindow = e.metaKey || e.ctrlKey

        let input = search.value
        let percentEncoded = encodeURIComponent(input)

        let href = `https://duckduckgo.com/?q=site%3Akvarn.org+${percentEncoded}`

        if (newWindow) {
            window.open(href, "_blank")
        } else {
            location.href = href
        }
    })
}

if (typeof hljs !== "undefined") {
    hljs.highlightAll()
}
