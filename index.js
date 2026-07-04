const k_reURL = /(https?:\/\/[\w.-]+\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const k_strBaseURL = "https://raw.githubusercontent.com/ricewind012/ricewind012.github.io/refs/heads/master";
const k_vecThemes = [
	"default",
];

/**
 * @template T
 * @param {T} vec
 * @returns {T}
 */
function RandomArrayElement( vec )
{
	return vec[ Math.floor( Math.random() * vec.length ) ];
}

const ThemeStore =
{
	m_elLink: document.querySelector( "link[rel='stylesheet']" ),

	/**
	 * @param {string} strTheme
	 */
	Change( strTheme )
	{
		ExtResourcesTracker.Add();
		this.m_elLink.href = `${ k_strBaseURL }/themes/${ strTheme }.css`;
	},
}

const ExtResourcesTracker =
{
	// <link> + <script> in the html
	m_unExternalResources: 2,

	Add()
	{
		this.m_unExternalResources++;
	},

	/**
	 * @param {string} strURL
	 */
	Fetch ( strURL )
	{
		this.Add();
		console.log( this.m_unExternalResources );
		return fetch( strURL );
	},
}

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

	async GetText()
	{
		const strFileName = this.getAttribute( "file-name" );
		if ( !strFileName )
		{
			return "no file-name attr";
		}

		const strURL = `${ k_strBaseURL }/things/${ strFileName }.md`;
		const result = await ExtResourcesTracker.Fetch( strURL );
		if ( !result.ok )
		{
			return `${ strURL } returned "${ await result.text() }"`;
		}

		const strContent = result.text();
		if ( !strContent )
		{
			return "no text";
		}

		return strContent;
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
				if ( len === 1 )
				{
					const strTitle = line.slice( len + 1 );
					document.title = strTitle;
					els.pageTitle.textContent = strTitle;
				}
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

			if ( line === "" )
			{
				if ( strParentTag !== "" )
				{
					this.AddLine( `</${ strParentTag }>` );
					strParentTag = "";
				}
				continue;
			}

			// text
			const strText = line.replace( /`(.*?)`/g, "<code> $1 </code>" );
			this.AddLine( strText, true );
		}
		return this.m_lines.join( "\n" );
	}

	async connectedCallback()
	{
		const strContent = await this.GetText();
		this.innerHTML = this.ParseText( strContent );
	}
}
customElements.define( "markdown-renderer", CMarkdownRendererElement );

let els = {};

document.addEventListener( "DOMContentLoaded", () => {
	const id = (sel) => document.getElementById( sel );
	els = {
		changeThemeBtn: id( "change-theme" ),
		extResInfo: id( "footer-ext-res-info" ),
		pageTitle: id( "page-title" ),
	};

	els.changeThemeBtn.addEventListener( "click", () => {
		const strTheme = RandomArrayElement( k_vecThemes );
		ThemeStore.Change( strTheme );
		els.extResInfo.dataset.count = ExtResourcesTracker.m_unExternalResources.toString();
	} );
} );
