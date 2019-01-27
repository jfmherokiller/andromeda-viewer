import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import 'jest-enzyme'
import 'jest-styled-components'
import { toHaveNoViolations } from 'jest-axe'

configure({ adapter: new Adapter() })
expect.extend(toHaveNoViolations)
