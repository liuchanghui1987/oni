import * as React from "react"
import { connect } from "react-redux"
import styled from "styled-components"

import { Icon } from "./../../UI/Icon"
import { fadeInAndDown } from "./animations"
import { boxShadow } from "./common"

import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"

const CommandLineBox = styled<{ visible: boolean }, "div">("div")`
    ${p => !p.visible && `visibility: hidden`};
    position: relative;
    margin-top: 16px;
    padding: 8px;
    width: 75%;
    max-width: 900px;
    background-color: ${p => p.theme["menu.background"]};
    ${boxShadow};
    animation: ${fadeInAndDown} 0.08s ease-in;
    box-sizing: border-box;
    overflow-wrap: break-word;
`
const CommandLineOutput = styled.div`
    white-space: pre-wrap; /* CRUCIAL to render white-space correctly */
    position: relative;
    border: 0px;
    background-color: rgba(0, 0, 0, 0.2);
    font-size: 1.1em;
    box-sizing: border-box;
    width: 100%;
    height: auto;
    padding: 8px;
    outline: none;
    color: white;
`

const Cursor = styled.span`
    background-color: white;
    width: 2px;
    position: absolute;
    bottom: 6px;
    height: 1.3em;
`

const ArrowContainer = styled.span`
    font-size: 0.7em;
    margin-right: 0.6em;
`

export interface ICommandLineRendererProps {
    showIcons: boolean
    visible: boolean
    content: string
    position: number
    firstchar: string
    level: number
    prompt: string
}

interface State {
    focused: boolean
}

export const CommandLineIcon = (props: { iconName: string; arrow?: boolean }) => (
    <span>
        {!props.arrow ? (
            <Icon name={props.iconName} />
        ) : (
            <ArrowContainer>
                <Icon name={props.iconName} />
            </ArrowContainer>
        )}
    </span>
)

export class CommandLine extends React.PureComponent<ICommandLineRendererProps, State> {
    public state = {
        focused: false,
    }

    private _inputElement: HTMLInputElement

    public componentWillReceiveProps(nextProps: ICommandLineRendererProps) {
        if (!this.state.focused && nextProps.visible) {
            this.setState({ focused: true })
        }
    }

    public renderIconOrChar(character: string) {
        if (!this.props.showIcons) {
            return character
        }
        switch (character) {
            case "/":
                return [
                    <CommandLineIcon iconName="search" key={`${character}-search`} />,
                    <CommandLineIcon
                        arrow
                        iconName="arrow-right"
                        key={`${character}-arrow-right`}
                    />,
                ]
            case "?":
                return [
                    <CommandLineIcon iconName="search" key={`${character}-search`} />,
                    <CommandLineIcon key={`${character}-arrow-left`} arrow iconName="arrow-left" />,
                ]
            default:
                return character
        }
    }

    public getCommandLineSections() {
        const { content, position } = this.props
        if (content) {
            const segments = content.split("")
            const beginning = segments.slice(0, position)
            const end = segments.slice(position)
            return { beginning, end }
        }
        return null
    }

    public render(): null | JSX.Element {
        const { visible, firstchar } = this.props
        const { focused } = this.state

        if (!focused && visible && this._inputElement) {
            this._inputElement.focus()
        }

        const segments = this.getCommandLineSections()

        return (
            <CommandLineBox visible={visible} className="command-line">
                <CommandLineOutput
                    innerRef={e => (this._inputElement = e)}
                    className="command-line-output"
                >
                    {this.renderIconOrChar(firstchar)}
                    {this.props.prompt}
                    {segments && segments.beginning}
                    <Cursor />
                    {segments && segments.end}
                </CommandLineOutput>
            </CommandLineBox>
        )
    }
}

const mapStateToProps = ({ commandLine, configuration }: State.IState) => {
    const { visible, position, content, firstchar, level, prompt } = commandLine
    return {
        showIcons: configuration["commandline.icons"],
        visible,
        content,
        firstchar,
        position,
        level,
        prompt,
    }
}

export default connect<ICommandLineRendererProps>(mapStateToProps)(CommandLine)
