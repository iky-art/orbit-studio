const SAFE_URL = /^(https?:\/\/|\/|mailto:)/i

function renderInline(text, prefix) {
  const nodes = []
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g
  let last = 0
  let index = 0
  let match = pattern.exec(text)
  while (match) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    const key = `${prefix}-${index}`
    if (match[1]) {
      nodes.push(
        SAFE_URL.test(match[2]) ? (
          <a
            key={key}
            href={match[2]}
            target={match[2].startsWith('/') ? undefined : '_blank'}
            rel="noopener noreferrer"
          >
            {match[1]}
          </a>
        ) : (
          match[1]
        ),
      )
    } else if (match[3]) {
      nodes.push(<strong key={key}>{match[3]}</strong>)
    } else {
      nodes.push(<code key={key}>{match[4]}</code>)
    }
    last = match.index + match[0].length
    index += 1
    match = pattern.exec(text)
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

/** Parser Markdown ringan dan aman: judul, daftar, tebal, kode, dan tautan. */
export function parseMarkdown(source) {
  const lines = String(source ?? '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let paragraph = []
  let list = null
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: 'p', text: paragraph.join(' ') })
    paragraph = []
  }
  const flushList = () => {
    if (list) blocks.push(list)
    list = null
  }
  lines.forEach((raw) => {
    const line = raw.trimEnd()
    if (!line.trim()) {
      flushParagraph()
      flushList()
      return
    }
    let match = /^(#{1,3})\s+(.*)$/.exec(line)
    if (match) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'h', level: match[1].length, text: match[2] })
      return
    }
    match = /^\s*[-*]\s+(.*)$/.exec(line)
    if (match) {
      flushParagraph()
      if (!list || list.type !== 'ul') {
        flushList()
        list = { type: 'ul', items: [] }
      }
      list.items.push(match[1])
      return
    }
    match = /^\s*\d+[.)]\s+(.*)$/.exec(line)
    if (match) {
      flushParagraph()
      if (!list || list.type !== 'ol') {
        flushList()
        list = { type: 'ol', items: [] }
      }
      list.items.push(match[1])
      return
    }
    flushList()
    paragraph.push(line.trim())
  })
  flushParagraph()
  flushList()
  return blocks
}

export function Markdown({ source }) {
  return parseMarkdown(source).map((block, index) => {
    const key = `b${index}`
    if (block.type === 'h') {
      const Tag = `h${Math.min(block.level + 1, 4)}`
      return <Tag key={key}>{renderInline(block.text, key)}</Tag>
    }
    if (block.type === 'ul' || block.type === 'ol') {
      const Tag = block.type
      return (
        <Tag key={key}>
          {block.items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
          ))}
        </Tag>
      )
    }
    return <p key={key}>{renderInline(block.text, key)}</p>
  })
}

export function plainExcerpt(source, max = 140) {
  const first = parseMarkdown(source).find((block) => block.type === 'p')
  const text = (first?.text ?? '').replace(/[*`]|\[([^\]]+)\]\([^)]+\)/g, '$1')
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

export function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
