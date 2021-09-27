
module.exports = async function (context, req) {
  console.log(context.bindingData.sys.methodName)
  return context.bindingData.id
}
