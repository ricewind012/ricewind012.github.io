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
	ParseText( strText )
	{
		let strParentTag = "";
		const lines = [];
		for ( const line of strText.split( "\n" ) )
		{
			if ( line.startsWith( "#" ) )
			{
				const len = line.match( /^#+/g ).length;
				const strTag = `h${ len }`
				lines.push( `<${ strTag }> ${ line.slice( len ) } </${ strTag }>` );
				continue;
			}

			if ( line.startsWith( "```" ) )
			{
				lines.push( line === "```" ? "</pre>" : "<pre>" );
				continue;
			}

			if ( line.startsWith( "- " ) )
			{
				if ( strParentTag !== "ul" )
				{
					strParentTag = "ul";
					lines.push( "<ul>" );
				}
				lines.push( `<li> ${ line.slice( 2 ) } </li>` );
				continue;
			}

			if ( line === "" && strParentTag === "ul" )
			{
				strParentTag = "";
				lines.push( "</ul>" );
			}

			// text
			const strText = line.replace( /`(.*?)`/g, "<code> $1 </code>" );
			lines.push( strText );
		}
		return lines.join( "\n" );
	}

	async connectedCallback()
	{
		const strFileName = this.getAttribute( "file-name" );
		if ( !strFileName )
		{
			return "no file-name attr";
		}

		const strContent = await ( await fetch( `${k_strThingsURL}/${strFileName}.md` ) ).text()
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
