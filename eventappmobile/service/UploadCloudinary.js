export const UploadCloudinary = async (image) => {
    let data = new FormData();
    data.append('file', {
        uri: image.uri,
        type: image.type,
        name: image.fileName || 'avatar.jpg'
    });
    data.append('upload_preset', 'myevent'); 
    data.append('cloud_name', 'dmt3j04om');

    const res = await fetch('https://api.cloudinary.com/v1_1/dmt3j04om/image/upload', {
        method: 'POST',
        body: data
    });

    const json = await res.json();
    return json.secure_url;
}