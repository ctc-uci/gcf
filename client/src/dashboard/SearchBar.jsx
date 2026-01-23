import {
    Input,
    InputGroup,
    InputLeftElement
} from "@chakra-ui/react";

function SearchBar({text, onChange}) {
    return (
        <InputGroup>
            <InputLeftElement>
            
            </InputLeftElement>

            <Input
            placeholder="Type to Search"
            text={text}
            onChange={(e) => onChange(e.target.value)}/>
        </InputGroup>
    )
}

export default SearchBar;