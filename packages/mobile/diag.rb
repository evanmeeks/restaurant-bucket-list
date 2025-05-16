require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '13.0'
install! 'cocoapods', :deterministic_uuids => false

target 'mobile' do
  config = use_native_modules!
  use_react_native!(
    :path => '../node_modules/react-native',
    :hermes_enabled => true
  )

  pod 'hermes-engine', :podspec => '../node_modules/hermes-engine/hermes-engine.podspec'

  target 'mobileTests' do
    inherit! :complete
    # Pods for testing
  end
end