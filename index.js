const k_reURL = /(https?:\/\/[\w.-]+\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const k_strThingsURL = "https://raw.githubusercontent.com/ricewind012/ricewind012.github.io/refs/heads/master/things";

class CBaseCustomElement extends HTMLElement
{
	/**
	 * Take a guess
	 * @param {string} strTag
	 * @param {Record< string, string >} attrs
	 */
	CreateElement( strTag, attrs )
	{
		const el = document.createElement( strTag );
		for ( const [ k, v ] of attrs )
		{
			el.setAttribute( k, v );
		}
		this.appendChild( el );

		return el;
	}
}

// Attributes:
// file-name | string
class CMarkdownRendererElement extends CBaseCustomElement
{
	/** @type {string[]} */
	m_lines = [];

	/**
	 * @param {string} strText
	 * @param {boolean} bNeedsParsing
	 */
	AddLine( strText, bNeedsParsing = false )
	{
		if ( !bNeedsParsing )
		{
			this.m_lines.push( strText );
			return;
		}

		const strParsed = strText.replace( k_reURL, "<a href='$1'> $1 </a>" );
		this.m_lines.push( strParsed );
	}

	/**
	 * @param {string} strText
	 */
	ParseText( strText )
	{
		let strParentTag = "";
		for ( const line of strText.split( "\n" ) )
		{
			if ( line.startsWith( "#" ) )
			{
				const len = line.match( /^#+/g ).length;
				const strTag = `h${ len }`
				this.AddLine( `<${ strTag }> ${ line.slice( len ) } </${ strTag }>`, true );
				continue;
			}

			if ( line.startsWith( "```" ) )
			{
				this.AddLine( line === "```" ? "</pre>" : "<pre>" );
				continue;
			}

			if ( line.startsWith( "- " ) )
			{
				if ( strParentTag !== "ul" )
				{
					strParentTag = "ul";
					this.AddLine( "<ul>" );
				}
				this.AddLine( `<li> ${ line.slice( 2 ) } </li>`, true );
				continue;
			}

			if ( line === "" && strParentTag !== "" )
			{
				this.AddLine( `</${ strParentTag }>` );
				strParentTag = "";
			}

			// text
			const strText = line.replace( /`(.*?)`/g, "<code> $1 </code>" );
			this.AddLine( strText, true );
		}
		return this.m_lines.join( "\n" );
	}

	async connectedCallback()
	{
		const strFileName = this.getAttribute( "file-name" );
		if ( !strFileName )
		{
			return "no file-name attr";
		}

		const strContent = await ( await fetch( `${ k_strThingsURL }/${ strFileName }.md` ) ).text()
		if ( !strContent )
		{
			return "no text";
		}

		this.innerHTML = this.ParseText( strContent );
	}
}
customElements.define( "markdown-renderer", CMarkdownRendererElement );

document.addEventListener( "DOMContentLoaded", () => {
	const [ elHeader, elContent, elFooter ] = document.body.children;
	console.log( {elHeader, elContent, elFooter} );
} );
